import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'
import { NotFoundException } from '@nestjs/common'
import { Between, Repository } from 'typeorm'

import { User } from '../auth/entities/user.entity'
import { CreateListDto } from './dto/create-list.dto'
import { List } from './entities/list.entity'
import { ListsService } from './lists.service'
import { UpdateListDto } from './dto/update-list.dto'

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

  it('update() should update list without reordering tasks', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1', title: 'task 1' } as List
    const dto = { title: 'title updated' } as UpdateListDto

    jest.spyOn(service, 'findOne').mockResolvedValue(list)
    jest
      .spyOn(listRepository, 'save')
      .mockResolvedValue({ id: 'l1', title: 'title updated' } as List)
    jest
      .spyOn(listRepository, 'merge')
      .mockReturnValue({ id: 'l1', title: 'title updated' } as List)

    const result = await service.update(list.id, dto, user)

    expect(result).toEqual({ id: 'l1', title: 'title updated' })
  })

  it('update() should throw a NotFoundException is list is not found', async () => {
    const user = { id: 'u1' } as User
    const dto = { title: 'title updated' } as UpdateListDto

    jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException())
    const saveSpy = jest.spyOn(listRepository, 'save')

    await expect(service.update('bad', dto, user)).rejects.toBeInstanceOf(
      NotFoundException
    )
    expect(saveSpy).not.toHaveBeenCalled()
  })

  it('update() should not update the order if originalOrder and newOrder are equal', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1', order: 1 } as List
    const dto = { order: 1 } as UpdateListDto

    jest.spyOn(service, 'findOne').mockResolvedValue(list)
    const findSpy = jest.spyOn(listRepository, 'find')

    await service.update(list.id, dto, user)

    expect(findSpy).not.toHaveBeenCalled()
  })

  it('update() should update other tasks order if new order is bigger', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1', order: 1 } as List
    const lists = [{ order: 0 }, { order: 2 }] as List[]
    const dto = { order: 2 } as UpdateListDto

    jest.spyOn(listRepository, 'find').mockResolvedValue(lists)
    jest.spyOn(service, 'findOne').mockResolvedValue(list)
    const findSpy = jest.spyOn(listRepository, 'find')
    const saveSpy = jest.spyOn(listRepository, 'save')

    await service.update(list.id, dto, user)

    expect(findSpy).toHaveBeenCalledWith({
      where: {
        user: { id: user.id },
        order: Between(1 + 1, 2)
      }
    })
    // expect(saveSpy).toHaveBeenNthCalledWith(1, [{ order: 0 }, { order: 1 }])
    expect(saveSpy).toHaveBeenLastCalledWith({ id: 'l1', order: 2 })
  })

  it('update() should update other tasks order if new order is smaller', async () => {
    const user = { id: 'u1' } as User
    const list = { id: 'l1', order: 1 } as List
    const lists = [{ order: 0 }, { order: 2 }] as List[]
    const dto = { order: 0 } as UpdateListDto

    jest.spyOn(listRepository, 'find').mockResolvedValue(lists)
    jest.spyOn(service, 'findOne').mockResolvedValue(list)
    const findSpy = jest.spyOn(listRepository, 'find')
    const saveSpy = jest.spyOn(listRepository, 'save')

    await service.update(list.id, dto, user)

    expect(findSpy).toHaveBeenCalledWith({
      where: {
        user: { id: user.id },
        order: Between(0, 1 - 1)
      }
    })
    // expect(saveSpy).toHaveBeenNthCalledWith(1, [{ order: 0 }, { order: 1 }])
    expect(saveSpy).toHaveBeenLastCalledWith({ id: 'l1', order: 0 })
  })
})
