import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BaseEntity } from './base.entity'
import { EPropertyChargeAmountType } from '@pkg/types/PropertyCharge'
import { PropertyEntity } from './property.entity'
import { decimalTransformer } from '../transformers/decimal.transformer'

@Entity('property_charges')
export class PropertyChargeEntity extends BaseEntity {
  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: decimalTransformer,
  })
  amount!: number

  @Column({ type: 'varchar', length: 320 })
  description!: string

  @Column({
    type: 'enum',
    enum: EPropertyChargeAmountType,
    name: 'charge_amount_type',
  })
  chargeAmountType!: EPropertyChargeAmountType

  @ManyToOne(() => PropertyEntity, (property) => property.charges, {
    nullable: false,
  })
  @JoinColumn({ name: 'property_id' })
  property!: PropertyEntity
}
