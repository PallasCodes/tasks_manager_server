import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from './entities/task.entity'
import { ListsService } from 'src/lists/lists.service'

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly listsService: ListsService
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { listId, ...restCreateTaskDto } = createTaskDto
    const list = await this.listsService.findOne(listId)

    return this.taskRepository.save({ ...restCreateTaskDto, list })
  }

  findAll() {
    return `This action returns all tasks`
  }

  findOne(id: number) {
    return `This action returns a #${id} task`
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`
  }

  remove(id: number) {
    return `This action removes a #${id} task`
  }
}
