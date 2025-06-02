import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import {
  Between,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Repository
} from 'typeorm'

import { User } from '../auth/entities/user.entity'
import { CreateListDto } from './dto/create-list.dto'
import { UpdateListDto } from './dto/update-list.dto'
import { List } from './entities/list.entity'

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private readonly listRepository: Repository<List>
  ) {}

  async create(createListDto: CreateListDto, user: User) {
    const order = await this.listRepository.countBy({ user: { id: user.id } })
    return this.listRepository.save({
      ...createListDto,
      user,
      order: order + 1
    })
  }

  findAll(user: User) {
    return this.listRepository.find({
      where: { user: { id: user.id } },
      loadRelationIds: { relations: ['user'] },
      relations: ['tasks'],
      order: { order: 'ASC', tasks: { createdAt: 'DESC' } }
    })
  }

  findOne(id: string, user: User) {
    return this.listRepository.findOneByOrFail({ id, user }).catch(() => {
      throw new NotFoundException(`List with id ${id} not found`)
    })
  }

  async update(id: string, updateListDto: UpdateListDto, user: User) {
    const list = await this.findOne(id, user)

    const originalOrder = list.order
    const newOrder = updateListDto.order

    if (newOrder !== undefined && newOrder !== originalOrder) {
      if (newOrder > originalOrder) {
        const listsToUpdate = await this.listRepository.find({
          where: {
            user: { id: user.id },
            order: Between(originalOrder + 1, newOrder)
          }
        })

        for (const l of listsToUpdate) {
          l.order -= 1
        }
        await this.listRepository.save(listsToUpdate)
      } else {
        const listsToUpdate = await this.listRepository.find({
          where: {
            user: { id: user.id },
            order: Between(newOrder, originalOrder - 1)
          }
        })

        for (const l of listsToUpdate) {
          l.order += 1
        }
        await this.listRepository.save(listsToUpdate)
      }

      list.order = newOrder
    }

    this.listRepository.merge(list, updateListDto)
    return this.listRepository.save(list)
  }

  async remove(id: string, user: User) {
    const list = await this.findOne(id, user)

    return this.listRepository.remove(list)
  }
}
