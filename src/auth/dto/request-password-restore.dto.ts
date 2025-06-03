import { IsEmail } from 'class-validator'

export class RequestPasswordRestoreDto {
  @IsEmail()
  email: string
}
