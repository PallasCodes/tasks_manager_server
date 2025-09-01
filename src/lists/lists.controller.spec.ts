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
import { ListsController } from './lists.controller'
import { ListsService } from './lists.service'
import { CreateListDto } from './dto/create-list.dto'
import { User } from 'src/auth/entities/user.entity'
import { List } from './entities/list.entity'
import { UpdateListDto } from './dto/update-list.dto'

describe('ListsController', () => {
  let controller: ListsController
  let listsService: ListsService

  beforeEach(async () => {
    const mockListsService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        {
          provide: ListsService,
          useValue: mockListsService
        }
      ]
    }).compile()

    controller = module.get<ListsController>(ListsController)
    listsService = module.get<ListsService>(ListsService)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })

  it('create() should create a list with the proper DTO', async () => {
    const user = { id: 'u1' } as User
    const dto: CreateListDto = {
      title: 'list 1'
    }

    await controller.create(dto, user)

    expect(listsService.create).toHaveBeenCalled()
    expect(listsService.create).toHaveBeenCalledWith(dto, user)
  })

  it('findAll() should fetch all lists from the user', async () => {
    const user = { id: 'u1' } as User
    const lists = [{ title: 'list 1' }, { title: 'list 2' }] as List[]

    jest.spyOn(listsService, 'findAll').mockResolvedValue(lists)

    const result = await controller.findAll(user)

    expect(result).toEqual(lists)
  })

  it('findOne() should find a list', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1' } as List

    jest.spyOn(listsService, 'findOne').mockResolvedValue(list)

    const result = await controller.findOne(list.id, user)

    expect(result).toEqual(list)
  })

  it('update() should update a list with the proper DTO', async () => {
    const user = { id: 'u1' } as User
    const dto: UpdateListDto = { title: 'updated list' }
    const listId = 'l1'

    await controller.update(listId, dto, user)

    expect(listsService.update).toHaveBeenCalled()
    expect(listsService.update).toHaveBeenCalledWith(listId, dto, user)
  })

  it('update() should delete a list if id param is given', async () => {
    const user = { id: 'u1' } as User
    const listId = 'l1'

    await controller.remove(listId, user)

    expect(listsService.remove).toHaveBeenCalled()
    expect(listsService.remove).toHaveBeenCalledWith(listId, user)
  })
})
