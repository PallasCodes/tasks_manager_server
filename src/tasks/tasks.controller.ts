import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'

import { GetUser } from '../auth/decorators'
import { User } from '../auth/entities/user.entity'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { TasksService } from './tasks.service'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto, @GetUser() user: User) {
    return this.tasksService.create(createTaskDto, user)
  }

  @Get()
  findAll() {
    return this.tasksService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id)
  }
}
