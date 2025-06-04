import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'

import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { sendEmail } from 'src/utils/send-email.util'
import { List } from '../lists/entities/list.entity'
import { CreateUserDto, LoginUserDto, RequestPasswordRestoreDto } from './dto'
import { RestorePasswordDto } from './dto/restore-password.dto'
import { User } from './entities/user.entity'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(List) private readonly listRepository: Repository<List>,
    private readonly jwtService: JwtService
  ) {}

  async requestPasswordRestore({ email }: RequestPasswordRestoreDto) {
    try {
      const user = await this.userRepository
        .findOneByOrFail({ email })
        .catch(() => {
          throw new NotFoundException('User not found')
        })

      const token = this.jwtService.sign(
        { id: user.id, email: user.email },
        { expiresIn: '15m' }
      )

      const emailBody = `
        <p><a href="${process.env.CLIENT_URL}/restore-password?token=${token}" target="_blank">Click here</a> to restore your password at tasks-manager.bernardo-torres.com</p>
        <p><i>*This link will expire in 15 minutes</i></p>
        `
      const { error } = await sendEmail({
        to: email,
        subject: 'Password restore',
        html: emailBody
      })
      // TODO: enhance error handling
      if (error) throw new Error()

      return { message: 'We have sent you an email to restore your password' }
    } catch (error) {
      throw new InternalServerErrorException()
    }
  }
  async restorePassword(dto: RestorePasswordDto) {
    let payload: any

    try {
      payload = await this.jwtService.verifyAsync(dto.token)
    } catch (err) {
      throw new BadRequestException('Invalid or expired token')
    }

    const user = await this.userRepository.findOneBy({ email: payload.email })

    if (!user) {
      throw new NotFoundException('User not found')
    }

    user.password = await bcrypt.hash(dto.newPassword, 10)
    await this.userRepository.save(user)

    return {
      message: 'Password restored successfully!'
    }
  }

  async register(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto

      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      })
      await this.userRepository.save(user)
      const list = this.listRepository.create({
        title: 'ToDo',
        user: { id: user.id },
        order: 1
      })
      await this.listRepository.save(list)

      delete user.password

      return {
        user,
        token: this.jwtService.sign({ id: user.id }),
        tokenExpiration: this.getTokeExpirationDate()
      }
    } catch (error) {
      this.handleDBErrors(error)
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        isActive: true,
        roles: true,
        username: true
      }
    })

    if (!user) throw new UnauthorizedException('Credentials are not valid')

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Credentials are not valid')

    delete user.password

    return {
      user,
      token: this.jwtService.sign({ id: user.id }),
      tokenExpiration: this.getTokeExpirationDate()
    }
  }

  private handleDBErrors(error: any): never {
    if (error.code === '23505') {
      throw new ConflictException('This email is already registered')
    }

    console.log(error)
    throw new InternalServerErrorException('Check server logs')
  }

  private getTokeExpirationDate() {
    const now = new Date().getTime()
    return now + 24 * 60 * 60 * 1000
  }
}
