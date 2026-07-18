import { Column } from 'typeorm'

export class AuditEntity {
  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy!: string | null

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy!: string | null

  @Column({ name: 'deleted_by', type: 'varchar', nullable: true })
  deletedBy!: string | null
}
