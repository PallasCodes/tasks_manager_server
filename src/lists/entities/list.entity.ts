import { ApiProperty } from '@nestjs/swagger'

import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm'

import { User } from '../../auth/entities/user.entity'
import { Task } from '../../tasks/entities/task.entity'
import { BaseEntity } from '../../common/entities/base-entity.entity'

@Entity()
export class List extends BaseEntity {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ nullable: false })
  @Column('text', { nullable: false })
  title: string

  @ApiProperty()
  @Column('int')
  order: number

  @ApiProperty({ nullable: true })
  @OneToMany(() => Task, (task) => task.list)
  tasks: Task[]

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.lists, { onDelete: 'CASCADE' })
  user: User
}
