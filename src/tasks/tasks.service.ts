import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Between, FindManyOptions, Repository } from 'typeorm'

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

    const order = await this.taskRepository.count({
      where: { list: { id: list.id }, done: false }
    })

    return this.taskRepository.save({
      ...restCreateTaskDto,
      list,
      order: order + 1
    })
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

  findOne(id: string, user: User, listRelation = false) {
    return this.taskRepository
      .findOne({
        where: {
          id,
          list: {
            user: { id: user.id }
          }
        },
        relations: [listRelation ? 'list' : null]
      })
      .catch(() => {
        throw new NotFoundException(`Task with id ${id} not found`)
      })
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User) {
    const task = await this.findOne(id, user, true)

    const originalOrder = task.order
    const newOrder = updateTaskDto.order

    if (newOrder !== undefined && newOrder !== originalOrder) {
      if (newOrder > originalOrder) {
        const tasksToUpdate = await this.taskRepository.find({
          where: {
            list: { id: task.list.id },
            order: Between(originalOrder + 1, newOrder)
          }
        })

        for (const t of tasksToUpdate) {
          t.order -= 1
        }

        await this.taskRepository.save(tasksToUpdate)
      } else {
        const tasksToUpdate = await this.taskRepository.find({
          where: {
            list: { id: task.list.id },
            order: Between(newOrder, originalOrder - 1)
          }
        })

        for (const t of tasksToUpdate) {
          t.order += 1
        }

        await this.taskRepository.save(tasksToUpdate)
      }

      task.order = newOrder
    }

    this.taskRepository.merge(task, updateTaskDto)
    return this.taskRepository.save(task)
  }

  async remove(id: string, user: User) {
    const task = await this.findOne(id, user)

    return this.taskRepository.remove(task)
  }
}
