import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Task } from '../tasks/entities/task.entity'
import { List } from './entities/list.entity'
import { ListsController } from './lists.controller'
import { ListsService } from './lists.service'

@Module({
  controllers: [ListsController],
  providers: [ListsService],
  imports: [TypeOrmModule.forFeature([List, Task])],
  exports: [ListsService]
})
export class ListsModule {}
