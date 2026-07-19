import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { ERentalContractStatus } from '@pkg/types'
import { decimalTransformer } from '../transformers/decimal.transformer'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { PropertyEntity } from './property.entity'
import { BaseEntity } from './base.entity'

@Entity('contracts')
export class ContractEntity extends BaseEntity {
  @Column({ name: 'start_date', type: 'timestamp' })
  startDate!: Date

  @Column({ name: 'end_date', type: 'timestamp', nullable: true })
  endDate!: Date | null

  @Column({
    name: 'rent_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  rentAmount!: number

  @Column({ name: 'due_day', type: 'int' })
  dueDay!: number

  @Column({ type: 'enum', enum: ERentalContractStatus })
  status!: ERentalContractStatus

  @ManyToOne(() => OwnerEntity, (owner) => owner.contracts, {
    nullable: false,
  })
  @JoinColumn({ name: 'owner_id' })
  owner!: OwnerEntity

  @RelationId((contract: ContractEntity) => contract.owner)
  ownerId!: string

  @ManyToOne(() => RenterEntity, (renter) => renter.contracts, {
    nullable: false,
  })
  @JoinColumn({ name: 'renter_id' })
  renter!: RenterEntity

  @RelationId((contract: ContractEntity) => contract.renter)
  renterId!: string

  @ManyToOne(() => PropertyEntity, (property) => property.contracts, {
    nullable: false,
  })
  @JoinColumn({ name: 'property_id' })
  property!: PropertyEntity

  @RelationId((contract: ContractEntity) => contract.property)
  propertyId!: string
}
