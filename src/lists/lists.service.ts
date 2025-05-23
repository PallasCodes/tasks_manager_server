import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { User } from '../auth/entities/user.entity'
import { CreateListDto } from './dto/create-list.dto'
import { UpdateListDto } from './dto/update-list.dto'
import { List } from './entities/list.entity'

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private readonly listRepository: Repository<List>
  ) {}

  create(createListDto: CreateListDto, user: User) {
    return this.listRepository.save({ ...createListDto, user })
  }

  findAll(user: User) {
    return this.listRepository.find({
      where: { user: { id: user.id } },
      loadRelationIds: { relations: ['user'] },
      relations: ['tasks']
    })
  }

  findOne(id: string, user: User) {
    return this.listRepository.findOneByOrFail({ id, user }).catch(() => {
      throw new NotFoundException(`List with id ${id} not found`)
    })
  }

  async update(id: string, updateListDto: UpdateListDto, user: User) {
    const list = await this.findOne(id, user)

    this.listRepository.merge(list, updateListDto)

    return this.listRepository.save(list)
  }

  async remove(id: string, user: User) {
    const list = await this.findOne(id, user)

    return this.listRepository.remove(list)
  }
}
