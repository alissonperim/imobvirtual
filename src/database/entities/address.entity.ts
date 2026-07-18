import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { generateId } from '../utils/generate-id'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { PropertyEntity } from './property.entity'

@Entity('addresses')
export class AddressEntity {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  id: string

  @Column()
  street: string

  @Column()
  neighborhood: string

  @Column({ name: 'postal_code' })
  postalCode: string

  @Column()
  complement: string

  @Column()
  city: string

  @Column()
  state: string

  @Column()
  number: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null

  @Column({ name: 'created_by', type: 'varchar', nullable: true })
  createdBy: string | null

  @Column({ name: 'updated_by', type: 'varchar', nullable: true })
  updatedBy: string | null

  @Column({ name: 'deleted_by', type: 'varchar', nullable: true })
  deletedBy: string | null

  @OneToOne(() => OwnerEntity, (owner) => owner.address)
  owner?: OwnerEntity

  @OneToOne(() => RenterEntity, (renter) => renter.address)
  renter?: RenterEntity

  @OneToOne(() => PropertyEntity, (property) => property.address)
  property?: PropertyEntity

  @BeforeInsert()
  assignGeneratedId() {
    if (!this.id) {
      this.id = generateId()
    }
  }
}
