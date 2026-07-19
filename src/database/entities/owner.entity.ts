import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  RelationId,
} from 'typeorm'
import { EMaritalStatus } from '@pkg/types'
import { AccountEntity } from './account.entity'
import { AddressEntity } from './address.entity'
import { PropertyEntity } from './property.entity'
import { ContractEntity } from './contract.entity'
import { BaseEntity } from './base.entity'

@Entity('owners')
export class OwnerEntity extends BaseEntity {
  @Column()
  name!: string

  @Column({ unique: true })
  document!: string

  @Column({ name: 'phone_number' })
  phoneNumber!: string

  @Column({ type: 'varchar', nullable: true })
  email!: string | null

  @Column({ name: 'marital_status', type: 'enum', enum: EMaritalStatus })
  maritalStatus!: EMaritalStatus

  @OneToOne(() => AccountEntity, (account) => account.owner, {
    nullable: false,
  })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity

  @RelationId((owner: OwnerEntity) => owner.account)
  accountId!: string

  @OneToOne(() => AddressEntity, (address) => address.owner, {
    nullable: false,
    eager: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'address_id' })
  address!: AddressEntity

  @RelationId((owner: OwnerEntity) => owner.address)
  addressId!: string

  @OneToMany(() => PropertyEntity, (property) => property.owner)
  properties?: PropertyEntity[]

  @OneToMany(() => ContractEntity, (contract) => contract.owner)
  contracts?: ContractEntity[]
}
