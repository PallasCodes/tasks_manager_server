import { Body, Controller, Get, Post } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { CreateUserDto, LoginUserDto } from './dto'
import { User } from './entities/user.entity'
import { Auth } from './decorators'
import { ValidRoles } from './interfaces/valid-roles.interface'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiResponse({ status: 201, description: 'User was registered', type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('register')
  register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto)
  }

  @ApiResponse({ status: 201, description: 'User was logged in', type: User })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto)
  }
}
