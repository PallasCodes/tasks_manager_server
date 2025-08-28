import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { List } from './entities/list.entity'
import { ListsService } from './lists.service'
import { User } from 'src/auth/entities/user.entity'
import { CreateListDto } from './dto/create-list.dto'
import { NotFoundException } from '@nestjs/common'

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

  it('create() should create a list with order = count +1', async () => {
    const user = { id: 'u1' } as User
    const dto: CreateListDto = { title: 'new list' }

    jest.spyOn(listRepository, 'countBy').mockResolvedValue(3) // 3 lists in DB
    jest
      .spyOn(listRepository, 'save')
      .mockImplementation(async (payload: any) => ({ id: 'l1', ...payload }))

    const result = await service.create(dto, user)

    expect(result).toEqual({ ...dto, id: 'l1', user, order: 4 })
  })

  it('findAll() should return all list and its tasks from the given user', async () => {
    const user = { id: 'u1' } as User
    const lists = [{ id: 'l1' }, { id: 'l2' }] as List[]

    const saveSpy = jest.spyOn(listRepository, 'find')
    saveSpy.mockResolvedValue(lists)

    const result = await service.findAll(user)

    expect(saveSpy).toHaveBeenCalledWith({
      where: { user: { id: user.id } },
      loadRelationIds: { relations: ['user'] },
      relations: ['tasks'],
      order: { order: 'ASC', tasks: { order: 'ASC' } }
    })
    expect(result).toEqual(lists)
  })

  it('findOne() should return a list', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1' } as List

    const saveSpy = jest.spyOn(listRepository, 'findOneByOrFail')
    saveSpy.mockResolvedValue(list)

    const result = await service.findOne(list.id, user)

    expect(saveSpy).toHaveBeenCalledWith({ id: list.id, user })
    expect(result).toEqual(list)
  })

  it('findOne() should throw a NotFoundExceptions if a list was not found', async () => {
    const user = { id: 'u1' } as User

    jest
      .spyOn(listRepository, 'findOneByOrFail')
      .mockRejectedValue(new NotFoundException())

    try {
      await service.findOne('bad', user)
    } catch (error: any) {
      expect(error).toBeInstanceOf(NotFoundException)

      const errorMsg = error.getResponse().message
      expect(errorMsg).toBe('List with id bad not found')
    }
  })

  it('remove() should remove a list', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1' } as List

    const saveSpy = jest.spyOn(service, 'findOne')
    saveSpy.mockResolvedValue(list)
    jest.spyOn(listRepository, 'remove').mockResolvedValue(list)

    const result = await service.remove(list.id, user)

    expect(result).toEqual(list)
    expect(saveSpy).toHaveBeenCalledWith(list.id, user)
  })
})
