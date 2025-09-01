import 'reflect-metadata'

jest.mock('@nestjs/passport', () => {
  const actual = jest.requireActual('@nestjs/passport')
  return {
    ...actual,
    AuthGuard: () =>
      class MockAuthGuard {
        canActivate() {
          return true
        }
      }
  }
})

import { Test, TestingModule } from '@nestjs/testing'

import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { User } from 'src/auth/entities/user.entity'
import { UpdateTaskDto } from './dto/update-task.dto'

describe('TasksController', () => {
  let controller: TasksController
  let tasksService: TasksService

  beforeEach(async () => {
    const mockTasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService
        }
      ]
    }).compile()

    controller = module.get<TasksController>(TasksController)
    tasksService = module.get<TasksService>(TasksService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('create() should create a task with the proper DTO', async () => {
    const user = { id: 'u1' } as User
    const dto: CreateTaskDto = {
      listId: 'l1',
      pinned: false,
      title: 'new task'
    }

    await controller.create(dto, user)

    expect(tasksService.create).toHaveBeenCalled()
    expect(tasksService.create).toHaveBeenCalledWith(dto, user)
  })

  it('findAll() should fetch all tasks from the user', async () => {
    const user = { id: 'u1' } as User
    const pinned = false

    await controller.findAll(pinned, user)

    expect(tasksService.findAll).toHaveBeenCalled()
    expect(tasksService.findAll).toHaveBeenCalledWith(user, pinned)
  })

  it('findOne() should fetch a task from the user', async () => {
    const user = { id: 'u1' } as User
    const taskId = 't1'

    await controller.findOne(taskId, user)

    expect(tasksService.findOne).toHaveBeenCalled()
    expect(tasksService.findOne).toHaveBeenCalledWith(taskId, user)
  })

  it('update() should update a task form the user', async () => {
    const user = { id: 'u1' } as User
    const taskId = 't1'
    const dto: UpdateTaskDto = { title: 'new title' }

    await controller.update(taskId, dto, user)

    expect(tasksService.update).toHaveBeenCalled()
    expect(tasksService.update).toHaveBeenCalledWith(taskId, dto, user)
  })

  it('remove() should remove a task form the user', async () => {
    const user = { id: 'u1' } as User
    const taskId = 't1'

    await controller.remove(taskId, user)

    expect(tasksService.remove).toHaveBeenCalled()
    expect(tasksService.remove).toHaveBeenCalledWith(taskId, user)
  })
})
