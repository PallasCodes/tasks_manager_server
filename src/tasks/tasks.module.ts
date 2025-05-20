import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ListsModule } from '../lists/lists.module'
import { Task } from './entities/task.entity'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [TypeOrmModule.forFeature([Task]), ListsModule]
})
export class TasksModule {}
