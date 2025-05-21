import { ApiProperty, PartialType } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

import { CreateTaskDto } from './create-task.dto'

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @ApiProperty({ nullable: true })
  @IsBoolean()
  done?: boolean
}
