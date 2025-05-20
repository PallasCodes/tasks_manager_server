import { ApiProperty } from '@nestjs/swagger'
import { List } from 'src/lists/entities/list.entity'
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm'

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

  @ApiProperty({ nullable: true })
  @ManyToOne(() => List, (list) => list.tasks, {
    onDelete: 'SET NULL'
  })
  list: List
}
