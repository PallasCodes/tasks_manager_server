import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean, IsOptional } from 'class-validator'

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
}
