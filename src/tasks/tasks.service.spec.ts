import { BadRequestException, NotFoundException } from '@nestjs/common'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { User } from '../auth/entities/user.entity'
import { List } from '../lists/entities/list.entity'
import { ListsService } from '../lists/lists.service'
import { CreateTaskDto } from './dto/create-task.dto'
import { Task } from './entities/task.entity'
import { TasksService } from './tasks.service'

describe('TasksService', () => {
  let service: TasksService
  let taskRepository: Repository<Task>
  let listService: ListsService

  beforeEach(async () => {
    const mockTaskRepository: Partial<Repository<Task>> = {
      save: jest.fn(),
      count: jest.fn(),
      find: jest.fn(),
      countBy: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      findOneOrFail: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockTaskRepository
        },
        {
          provide: ListsService,
          useValue: {
            findOne: jest.fn()
          }
        }
      ]
    }).compile()

    service = module.get<TasksService>(TasksService)
    taskRepository = module.get<Repository<Task>>(getRepositoryToken(Task))
    listService = module.get<ListsService>(ListsService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('findAll() should fetch all products from the given user', async () => {
    const user = { id: 'user-1' } as User
    const repoResult = [{ id: 't1' }] as Task[]

    const spy = jest.spyOn(taskRepository, 'find').mockResolvedValue(repoResult)

    const result = await service.findAll(user)

    expect(spy).toHaveBeenCalledWith({
      where: { list: { user: { id: user.id } } },
      order: { createdAt: 'DESC' }
    })
    expect(result).toEqual(repoResult)
  })

  it('findAll() should fetch all PINNED products from the given user', async () => {
    const user = { id: 'user-1' } as User
    const repoResult = [{ id: 't1' }] as Task[]

    const spy = jest.spyOn(taskRepository, 'find').mockResolvedValue(repoResult)

    const result = await service.findAll(user, true)

    expect(spy).toHaveBeenCalledWith({
      where: { list: { user: { id: user.id } }, pinned: true },
      order: { createdAt: 'DESC' }
    })
    expect(result).toEqual(repoResult)
  })

  it('create() should create a task with order = count + 1 and without listId in the payload', async () => {
    const user = { id: 'user-1' } as User
    const list = { id: 'l1', user } as List

    const dto: CreateTaskDto = {
      listId: list.id,
      pinned: false,
      title: 'new task'
    }

    jest.spyOn(listService, 'findOne').mockResolvedValue(list)
    jest.spyOn(taskRepository, 'count').mockResolvedValue(3) // 3 tasks in DB
    const saveSpy = jest
      .spyOn(taskRepository, 'save')
      .mockImplementation(
        async (payload: any) => ({ id: 't1', ...payload }) as Task
      )

    const result = await service.create(dto, user)

    // Correct interactions
    expect(listService.findOne).toHaveBeenCalledWith(list.id, user)
    expect(taskRepository.count).toHaveBeenCalledWith({
      where: { list: { id: list.id }, done: false }
    })

    // Creation payload must not include listId
    expect(saveSpy).toHaveBeenCalledWith(
      expect.not.objectContaining({ listId: expect.anything() })
    )

    // Must include list and order = count + 1
    expect(saveSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'new task',
        pinned: false,
        list,
        order: 4
      })
    )

    // Correct result
    expect(result).toEqual(
      expect.objectContaining({ id: 't1', title: 'new task', list, order: 4 })
    )
  })

  it('create() should respect pinned = true from the DTO', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1', user } as List

    const dto: CreateTaskDto = {
      listId: list.id,
      pinned: true,
      title: 'new task'
    }

    jest.spyOn(listService, 'findOne').mockResolvedValue(list)
    jest.spyOn(taskRepository, 'count').mockResolvedValue(0)
    jest.spyOn(taskRepository, 'save').mockResolvedValue({
      id: 't1',
      title: 'X',
      pinned: true,
      list,
      order: 1
    } as Task)

    const result = await service.create(dto, user)

    expect(result.pinned).toBe(true)
    expect(result.order).toBe(1)
  })

  it('create() should throw a NotFoundException if the list does not exist', async () => {
    const user = { id: 'u1' } as User

    jest
      .spyOn(listService, 'findOne')
      .mockRejectedValue(new NotFoundException())

    await expect(
      service.create({ listId: 'bad', title: 'X', pinned: false }, user)
    ).rejects.toBeInstanceOf(NotFoundException)

    expect(taskRepository.count).not.toHaveBeenCalled()
    expect(taskRepository.save).not.toHaveBeenCalled()
  })

  it('findOne() implement the right querying', async () => {
    const user = { id: 'u1' } as User
    const task = { id: 't1' } as Task

    const saveSpy = jest
      .spyOn(taskRepository, 'findOneOrFail')
      .mockResolvedValue(task)

    const result = await service.findOne(task.id, user)

    expect(saveSpy).toHaveBeenCalledWith({
      where: {
        id: task.id,
        list: {
          user: { id: user.id }
        }
      },
      relations: []
    })
    expect(result).toEqual(task)
  })

  it('findOne() implement the right querying with LIST relation', async () => {
    const user = { id: 'u1' } as User
    const task = { id: 't1' } as Task

    const saveSpy = jest
      .spyOn(taskRepository, 'findOneOrFail')
      .mockResolvedValue(task)

    const result = await service.findOne(task.id, user, true)

    expect(saveSpy).toHaveBeenCalledWith({
      where: {
        id: task.id,
        list: {
          user: { id: user.id }
        }
      },
      relations: ['list']
    })
    expect(result).toEqual(task)
  })

  it('findOne() should throw a NotFoundException', async () => {
    const user = { id: 'u1' } as User

    jest
      .spyOn(taskRepository, 'findOneOrFail')
      .mockRejectedValue(new BadRequestException())

    try {
      await service.findOne('bad', user, true)
    } catch (error: any) {
      const errorMsg = error.getResponse().message
      expect(errorMsg).toBe('Task with id bad not found')

      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  it('remove() should return the removed task', async () => {
    const user = { id: 'u1' } as User
    const task = { id: 't1' } as Task

    jest.spyOn(service, 'findOne').mockResolvedValue(task)
    jest.spyOn(taskRepository, 'remove').mockResolvedValue(task)

    const result = await service.remove(task.id, user)

    expect(result).toEqual(task)
  })

  it('remove() should throw a NotFoundError if the task is not found', async () => {
    const user = { id: 'u1' } as User

    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())

    try {
      await service.remove('bad', user)
      fail('Must have throw NotFoundException')
    } catch (error: any) {
      expect(taskRepository.remove).not.toHaveBeenCalled()
      expect(error).toBeInstanceOf(NotFoundException)
    }
  })

  //  TODO: update() unit tests
})
