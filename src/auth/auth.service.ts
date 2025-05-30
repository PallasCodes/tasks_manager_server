import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'

import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { List } from '../lists/entities/list.entity'
import { CreateUserDto, LoginUserDto } from './dto'
import { User } from './entities/user.entity'
import { JwtPayload } from './interfaces/jwt-payload.interface'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(List) private readonly listRepository: Repository<List>,
    private readonly jwtService: JwtService
  ) {}

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
        user: { id: user.id }
      })
      await this.listRepository.save(list)

      delete user.password

      return {
        user,
        token: this.getJwtToken({ id: user.id }),
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
      token: this.getJwtToken({ id: user.id }),
      tokenExpiration: this.getTokeExpirationDate()
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload)
    return token
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
