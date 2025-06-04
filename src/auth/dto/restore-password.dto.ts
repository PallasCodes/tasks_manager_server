import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class RestorePasswordDto {
  @IsString()
  @MinLength(1)
  token: string

  @ApiProperty({ nullable: false })
  @IsString()
  @MinLength(8)
  @MaxLength(24)
  newPassword: string
}
