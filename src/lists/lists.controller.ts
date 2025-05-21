import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post
} from '@nestjs/common'

import { User } from '../auth/entities/user.entity'
import { Auth, GetUser } from '../auth/decorators'
import { CreateListDto } from './dto/create-list.dto'
import { UpdateListDto } from './dto/update-list.dto'
import { ListsService } from './lists.service'

@Auth()
@Controller('lists')
export class ListsController {
  constructor(private readonly listsService: ListsService) {}

  @Post()
  create(@Body() createListDto: CreateListDto, @GetUser() user: User) {
    return this.listsService.create(createListDto, user)
  }

  @Get()
  findAll(@GetUser() user: User) {
    return this.listsService.findAll(user)
  }

  @Get(':id')
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.listsService.findOne(id, user)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateListDto: UpdateListDto,
    @GetUser() user: User
  ) {
    return this.listsService.update(id, updateListDto, user)
  }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.listsService.remove(id, user)
  }
}
