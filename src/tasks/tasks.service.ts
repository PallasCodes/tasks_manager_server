import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { User } from '../auth/entities/user.entity'
import { ListsService } from '../lists/lists.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { UpdateTaskDto } from './dto/update-task.dto'
import { Task } from './entities/task.entity'

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
    private readonly listsService: ListsService
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User) {
    const { listId, ...restCreateTaskDto } = createTaskDto
    const list = await this.listsService.findOne(listId, user)

    return this.taskRepository.save({ ...restCreateTaskDto, list })
  }

  findAll(pinned?: boolean) {
    return pinned
      ? this.taskRepository.find({
          where: { pinned: true },
          order: { createdAt: 'DESC' }
        })
      : this.taskRepository.find({
          order: { createdAt: 'DESC' }
        })
  }

  findOne(id: string) {
    return this.taskRepository.findOneBy({ id }).catch(() => {
      throw new NotFoundException(`Task with id ${id} not found`)
    })
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id)
    this.taskRepository.merge(task, updateTaskDto)

    return this.taskRepository.save(task)
  }

  async remove(id: string) {
    const task = await this.findOne(id)

    return this.taskRepository.remove(task)
  }
}
