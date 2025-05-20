import { ApiProperty } from '@nestjs/swagger'
import { IsString, MaxLength, MinLength } from 'class-validator'

export class CreateListDto {
  @ApiProperty({ nullable: false })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string
}
