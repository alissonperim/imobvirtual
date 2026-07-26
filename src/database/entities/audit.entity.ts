import { Column } from 'typeorm'

export class AuditEntity {
  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy!: string

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy!: string

  @Column({ name: 'deleted_by', type: 'varchar', nullable: true })
  deletedBy!: string
}
