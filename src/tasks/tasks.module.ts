import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'

import { ListsModule } from '../lists/lists.module'
import { Task } from './entities/task.entity'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  controllers: [TasksController],
  providers: [TasksService],
  imports: [TypeOrmModule.forFeature([Task]), ListsModule, AuthModule]
})
export class TasksModule {}
