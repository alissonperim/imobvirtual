import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { EPropertyStatus } from '@pkg/types'
import { generateId } from '../utils/generate-id'
import { decimalTransformer } from '../transformers/decimal.transformer'
import { OwnerEntity } from './owner.entity'
import { AddressEntity } from './address.entity'
import { ContractEntity } from './contract.entity'

@Entity('properties')
@Index(['owner'])
@Index(['status'])
@Index(['deletedAt', 'createdAt'])
@Index(['owner', 'status', 'deletedAt'])
export class PropertyEntity {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  id: string

  @Column()
  name: string

  @Column({ type: 'varchar', nullable: true })
  description: string | null

  @Column({
    name: 'base_rent_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  baseRentAmount: number

  @Column({ name: 'solar_energy_active', default: false })
  solarEnergyActive: boolean

  @Column({ name: 'iptu_charge', default: false })
  iptuCharge: boolean

  @Column({ type: 'enum', enum: EPropertyStatus })
  status: EPropertyStatus

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

  @ManyToOne(() => OwnerEntity, (owner) => owner.properties, {
    nullable: false,
  })
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerEntity

  @RelationId((property: PropertyEntity) => property.owner)
  ownerId: string

  @OneToOne(() => AddressEntity, (address) => address.property, {
    nullable: true,
  })
  @JoinColumn({ name: 'address_id' })
  address: AddressEntity | null

  @RelationId((property: PropertyEntity) => property.address)
  addressId: string | null

  @OneToMany(() => ContractEntity, (contract) => contract.property)
  contracts?: ContractEntity[]

  @BeforeInsert()
  assignGeneratedId() {
    if (!this.id) {
      this.id = generateId()
    }
  }
}
