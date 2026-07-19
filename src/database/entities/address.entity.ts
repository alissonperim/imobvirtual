import { Column, Entity, OneToOne } from 'typeorm'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { PropertyEntity } from './property.entity'
import { BaseEntity } from './base.entity'

@Entity('addresses')
export class AddressEntity extends BaseEntity {
  @Column()
  street!: string

  @Column()
  neighborhood!: string

  @Column({ name: 'postal_code' })
  postalCode!: string

  @Column()
  complement!: string

  @Column()
  city!: string

  @Column()
  state!: string

  @Column()
  number!: string

  @OneToOne(() => OwnerEntity, (owner) => owner.address)
  owner?: OwnerEntity

  @OneToOne(() => RenterEntity, (renter) => renter.address)
  renter?: RenterEntity

  @OneToOne(() => PropertyEntity, (property) => property.address)
  property?: PropertyEntity
}
