import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { FindManyOptions, Repository } from 'typeorm'

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

  findAll(user: User, pinned?: boolean) {
    const baseQuery: FindManyOptions<Task> = {
      where: {
        list: {
          user: {
            id: user.id
          }
        }
      },
      order: { createdAt: 'DESC' }
    }
    if (pinned) baseQuery.where['pinned'] = true

    return this.taskRepository.find(baseQuery)
  }

  findOne(id: string, user: User) {
    return this.taskRepository
      .findOne({
        where: {
          id,
          list: {
            user: { id: user.id }
          }
        }
      })
      .catch(() => {
        throw new NotFoundException(`Task with id ${id} not found`)
      })
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user)
    this.taskRepository.merge(task, updateTaskDto)

    return this.taskRepository.save(task)
  }

  async remove(id: string, user: User) {
    const task = await this.findOne(id, user)

    return this.taskRepository.remove(task)
  }
}
