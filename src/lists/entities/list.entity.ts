import { ApiProperty } from '@nestjs/swagger'

import { Task } from '../../tasks/entities/task.entity'
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'
import { User } from 'src/auth/entities/user.entity'

@Entity()
export class List {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ nullable: false })
  @Column('text', { nullable: false })
  title: string

  @ApiProperty({ nullable: true })
  @OneToMany(() => Task, (task) => task.list)
  tasks: Task[]

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.lists)
  user: User
}
