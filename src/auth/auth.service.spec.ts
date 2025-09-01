import {
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { Repository } from 'typeorm'

import { List } from '../lists/entities/list.entity'
import { AuthService } from './auth.service'
import { CreateUserDto, LoginUserDto } from './dto'
import { RestorePasswordDto } from './dto/restore-password.dto'
import { User } from './entities/user.entity'
import { NotFoundError } from 'rxjs'

describe('AuthService', () => {
  let authService: AuthService
  let userRepository: Repository<User>

  beforeEach(async () => {
    const mockUserRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn()
    }

    const mockListRepository = {
      create: jest.fn(),
      save: jest.fn()
    }

    const mockJwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      verifyAsync: jest.fn().mockResolvedValue({ email: 'email@gmail.com' })
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository
        },
        {
          provide: getRepositoryToken(List),
          useValue: mockListRepository
        },
        {
          provide: JwtService,
          useValue: mockJwtService
        },

        AuthService
      ]
    }).compile()

    authService = module.get<AuthService>(AuthService)
    userRepository = module.get<Repository<User>>(getRepositoryToken(User))
  })

  it('should be defined', () => {
    expect(authService).toBeDefined()
  })

  it('register() should create a user and return user with token', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      password: 'Abc123',
      username: 'Test User'
    }

    const user = {
      email: dto.email,
      username: dto.username,
      id: '1',
      isActive: true,
      roles: ['user']
    } as User

    jest.spyOn(userRepository, 'create').mockReturnValue(user)
    jest.spyOn(bcrypt, 'hashSync').mockReturnValue('ABcbjAjkhas')

    const result = await authService.register(dto)

    expect(bcrypt.hashSync).toHaveBeenCalledWith('Abc123', 10)

    expect(result).toEqual({
      user: {
        email: 'test@google.com',
        username: 'Test User',
        id: '1',
        isActive: true,
        roles: ['user']
      },
      token: 'mock-jwt-token',
      tokenExpiration: expect.any(Number)
    })
  })

  it('should throw an error if email already exist', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      password: 'Abc123',
      username: 'Test User'
    }

    jest.spyOn(userRepository, 'save').mockRejectedValue({
      code: '23505',
      detail: 'This email is already registered'
    })

    await expect(authService.register(dto)).rejects.toThrow(ConflictException)
    await expect(authService.register(dto)).rejects.toThrow(
      'This email is already registered'
    )
  })

  it('should throw an internal server error', async () => {
    const dto = {
      email: 'test@google.com'
    } as CreateUserDto

    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    jest
      .spyOn(userRepository, 'save')
      .mockRejectedValue({ code: '9999', detail: 'Unhandled error' })

    await expect(authService.register(dto)).rejects.toThrow(
      InternalServerErrorException
    )
    await expect(authService.register(dto)).rejects.toThrow('Check server logs')

    expect(console.log).toHaveBeenCalledTimes(2)
    expect(console.log).toHaveBeenCalledWith({
      code: '9999',
      detail: 'Unhandled error'
    })

    logSpy.mockRestore()
  })

  it('should login user and return token', async () => {
    const dto: LoginUserDto = {
      email: 'test@gogle.com',
      password: 'Abc123'
    }

    const user = {
      ...dto,
      password: 'Abc123',
      isActive: true,
      roles: ['user'],
      username: 'Test User'
    } as User

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(user)
    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true)

    const result = await authService.login(dto)
    expect(result).toEqual({
      user: {
        email: 'test@gogle.com',
        isActive: true,
        roles: ['user'],
        username: 'Test User'
      },
      token: 'mock-jwt-token',
      tokenExpiration: expect.any(Number)
    })

    expect(result.user.password).not.toBeDefined()
    expect(result.user.password).toBeUndefined()
  })

  it('should throw an UnAuthorized Exception if user doest not exist', async () => {
    const dto = { email: 'test@google.com' } as LoginUserDto

    jest.spyOn(userRepository, 'findOne').mockResolvedValue(null)

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException)
    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid'
    )
  })

  it('should throw an UnAuthorized Exception if user doest not exist', async () => {
    const dto = { email: 'test@google.com' } as LoginUserDto

    jest.spyOn(userRepository, 'findOne').mockResolvedValue({
      password: 'Xyz123'
    } as User)

    jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false)

    await expect(authService.login(dto)).rejects.toThrow(UnauthorizedException)
    await expect(authService.login(dto)).rejects.toThrow(
      'Credentials are not valid'
    )
  })

  it('restorePassword() should change users password', async () => {
    const dto: RestorePasswordDto = { newPassword: 'newpass', token: '123' }

    jest
      .spyOn(authService, 'changePassword')
      .mockImplementation(async (payload: any) => {
        return new Promise((a) => a())
      })

    await authService.restorePassword(dto)

    expect(authService.changePassword).toHaveBeenCalled()
    expect(authService.changePassword).toHaveBeenCalledWith(
      'email@gmail.com',
      dto.newPassword
    )
  })

  it('changePassword() should throw a BadRequestException if user is not found by email', async () => {
    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(undefined)

    try {
      await authService.changePassword('email@gmail.com', 'newPass123')
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)

      const msg = error.getResponse().message
      expect(msg).toBe('User not found')
    }
  })

  it('changePassword() should update the users password', async () => {
    const hashedPass = await bcrypt.hash('.Password123', 10)
    const user = { id: 'u1', password: 'pass' } as User

    jest.spyOn(userRepository, 'findOneBy').mockResolvedValue(user)
    jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPass)

    await authService.changePassword('email@gmail.com', '.newPass123')

    expect(userRepository.save).toHaveBeenCalled()
    expect(userRepository.save).toHaveBeenCalledWith({
      id: 'u1',
      password: hashedPass
    })
  })
})
