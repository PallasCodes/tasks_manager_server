import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthModule } from '../auth/auth.module'
import { Task } from '../tasks/entities/task.entity'
import { List } from './entities/list.entity'
import { ListsController } from './lists.controller'
import { ListsService } from './lists.service'

@Module({
  controllers: [ListsController],
  providers: [ListsService],
  imports: [TypeOrmModule.forFeature([List, Task]), AuthModule],
  exports: [ListsService]
})
export class ListsModule {}
