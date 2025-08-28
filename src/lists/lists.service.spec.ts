import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { List } from './entities/list.entity'
import { ListsService } from './lists.service'

describe('ListsService', () => {
  let service: ListsService
  let listRepository: Repository<List>

  beforeEach(async () => {
    const mockListRepository: Partial<Repository<List>> = {
      countBy: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOneByOrFail: jest.fn(),
      merge: jest.fn(),
      remove: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        { provide: getRepositoryToken(List), useValue: mockListRepository }
      ]
    }).compile()

    service = module.get<ListsService>(ListsService)
    listRepository = module.get<Repository<List>>(getRepositoryToken(List))
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })
})
