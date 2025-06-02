import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength
} from 'class-validator'

export class CreateTaskDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string

  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    nullable: false
  })
  @IsUUID('4')
  listId: string

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  pinned: boolean

  @ApiProperty()
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  @IsOptional()
  description?: string
}
