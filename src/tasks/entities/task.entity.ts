import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { BaseEntity } from '../../common/entities/base-entity.entity'
import { List } from '../../lists/entities/list.entity'

@Entity()
export class Task extends BaseEntity {
  @ApiProperty({
    example: 'cd533345-f1f3-48c9-a62e-7dc2da50c8f8',
    uniqueItems: true
  })
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ApiProperty({ nullable: false })
  @Column('text', { nullable: false })
  title: string

  @ApiProperty({ nullable: false })
  @Column('boolean', { default: false })
  done: boolean

  @ApiProperty({ default: false })
  @Column('boolean', { default: false })
  pinned: boolean

  @ApiProperty()
  @Column('text', { nullable: true })
  description: string

  @ApiProperty()
  @Column('int', { nullable: true })
  estimatedTime: number

  @ApiProperty()
  @Column('int')
  order: number

  @ApiProperty({ nullable: true })
  @ManyToOne(() => List, (list) => list.tasks, {
    onDelete: 'SET NULL'
  })
  list: List
}
