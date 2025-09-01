import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'

export class UpdateListDto {
  @ApiProperty({ nullable: false })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @IsOptional()
  title?: string

  @ApiProperty()
  @IsOptional()
  @IsInt()
  @IsPositive()
  order?: number
}
