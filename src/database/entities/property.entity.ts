import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm'
import { EPropertyStatus } from '@pkg/types'
import { decimalTransformer } from '../transformers/decimal.transformer'
import { OwnerEntity } from './owner.entity'
import { AddressEntity } from './address.entity'
import { ContractEntity } from './contract.entity'
import { PropertyChargeEntity } from './property-charge.entity'
import { BaseEntity } from './base.entity'

@Entity('properties')
@Index(['owner'])
@Index(['status'])
@Index(['deletedAt', 'createdAt'])
@Index(['owner', 'status', 'deletedAt'])
export class PropertyEntity extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  description!: string | null

  @Column({
    name: 'rent_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  rentAmount!: number

  @Column({ name: 'solar_energy_active', default: false })
  solarEnergyActive!: boolean

  @Column({ type: 'enum', enum: EPropertyStatus })
  status!: EPropertyStatus

  @ManyToOne(() => OwnerEntity, (owner) => owner.properties, {
    nullable: false,
  })
  @JoinColumn({ name: 'owner_id' })
  owner!: OwnerEntity

  @RelationId((property: PropertyEntity) => property.owner)
  ownerId!: string

  @OneToOne(() => AddressEntity, (address) => address.property, {
    nullable: true,
    eager: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'address_id' })
  address!: AddressEntity | null

  @RelationId((property: PropertyEntity) => property.address)
  addressId!: string | null

  @OneToMany(() => ContractEntity, (contract) => contract.property)
  contracts?: ContractEntity[]

  @OneToMany(() => PropertyChargeEntity, (charge) => charge.property)
  charges?: PropertyChargeEntity[]
}
