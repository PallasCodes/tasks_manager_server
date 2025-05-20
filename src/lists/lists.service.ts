import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'

import { Repository } from 'typeorm'

import { CreateListDto } from './dto/create-list.dto'
import { UpdateListDto } from './dto/update-list.dto'
import { List } from './entities/list.entity'

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List) private readonly listRepository: Repository<List>
  ) {}

  create(createListDto: CreateListDto) {
    return this.listRepository.save(createListDto)
  }

  findAll() {
    return this.listRepository.find()
  }

  findOne(id: string) {
    return this.listRepository.findOneByOrFail({ id }).catch(() => {
      throw new NotFoundException(`List with id ${id} not found`)
    })
  }

  async update(id: string, updateListDto: UpdateListDto) {
    const list = await this.findOne(id)

    this.listRepository.merge(list, updateListDto)

    return this.listRepository.save(list)
  }

  async remove(id: string) {
    const list = await this.findOne(id)

    return this.listRepository.remove(list)
  }
}
