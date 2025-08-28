import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { ListsService } from '../lists/lists.service'
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
      remove: jest.fn()
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
})
