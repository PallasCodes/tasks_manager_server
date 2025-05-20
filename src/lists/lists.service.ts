import { Injectable } from '@nestjs/common'
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
    return `This action returns all lists`
  }

  findOne(id: number) {
    return `This action returns a #${id} list`
  }

  update(id: number, updateListDto: UpdateListDto) {
    return `This action updates a #${id} list`
  }

  remove(id: number) {
    return `This action removes a #${id} list`
  }
}
