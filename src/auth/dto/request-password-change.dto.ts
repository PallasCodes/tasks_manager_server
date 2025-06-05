import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class RequestPasswordChangeDto {
  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(36)
  newPassword: string
}
