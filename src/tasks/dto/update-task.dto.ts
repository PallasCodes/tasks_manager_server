import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator'

import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  done?: boolean

  @ApiProperty({ nullable: true })
  @IsBoolean()
  @IsOptional()
  pinned?: boolean

  @ApiProperty({ nullable: true })
  @IsInt()
  @IsPositive()
  @IsOptional()
  order?: number

  @ApiProperty({ nullable: true })
  @IsInt()
  @IsPositive()
  @IsOptional()
  estimatedTime?: number
}
