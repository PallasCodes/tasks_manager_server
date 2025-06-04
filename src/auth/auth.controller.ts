import { Body, Controller, Post } from '@nestjs/common'
import { ApiResponse } from '@nestjs/swagger'

import { AuthService } from './auth.service'
import { CreateUserDto, LoginUserDto, RequestPasswordRestoreDto } from './dto'
import { User } from './entities/user.entity'
import { RestorePasswordDto } from './dto/restore-password.dto'

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

  @ApiResponse({ status: 201 })
  @Post('restore-password')
  restorePassword(@Body() dto: RestorePasswordDto) {
    return this.authService.restorePassword(dto)
  }

  @ApiResponse({ status: 201 })
  @Post('request-password-restore')
  requestPasswordRestore(@Body() dto: RequestPasswordRestoreDto) {
    return this.authService.requestPasswordRestore(dto)
  }
}
