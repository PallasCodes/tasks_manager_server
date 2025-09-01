import { PassportModule } from '@nestjs/passport'
import { Test, TestingModule } from '@nestjs/testing'

import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { CreateUserDto, LoginUserDto } from './dto'

describe('AuthController', () => {
  let authController: AuthController
  let authService: AuthService

  beforeEach(async () => {
    const mockAuthService = {
      login: jest.fn(),
      checkAuthStatus: jest.fn(),
      register: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      imports: [PassportModule.register({ defaultStrategy: 'jwt' })],
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService
        }
      ]
    }).compile()

    authController = module.get<AuthController>(AuthController)
    authService = module.get<AuthService>(AuthService)
  })

  it('should be defined', () => {
    expect(authController).toBeDefined()
  })

  it('should create user with the proper DTO', async () => {
    const dto: CreateUserDto = {
      email: 'test@google.com',
      password: 'Abc123',
      username: 'Testuser'
    }

    await authController.register(dto)

    expect(authService.register).toHaveBeenCalled()
    expect(authService.register).toHaveBeenCalledWith(dto)
  })

  it('should loginUser with the proper DTO', async () => {
    const dto: LoginUserDto = {
      email: 'test@google.com',
      password: 'Abc123'
    }

    await authController.login(dto)

    expect(authService.login).toHaveBeenCalled()
    expect(authService.login).toHaveBeenCalledWith(dto)
  })
})
