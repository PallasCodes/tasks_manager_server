import {
  CreateDateColumn,
  UpdateDateColumn,
  BaseEntity as TypeORMBaseEntity
} from 'typeorm'

export abstract class BaseEntity extends TypeORMBaseEntity {
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date
}
