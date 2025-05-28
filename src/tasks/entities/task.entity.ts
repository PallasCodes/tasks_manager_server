import { ApiProperty } from '@nestjs/swagger'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

import { List } from '../../lists/entities/list.entity'

@Entity()
export class Task {
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

  @ApiProperty({ nullable: true })
  @ManyToOne(() => List, (list) => list.tasks, {
    onDelete: 'SET NULL'
  })
  list: List
}
