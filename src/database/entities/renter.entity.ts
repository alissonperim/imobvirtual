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
import { ContractEntity } from './contract.entity'
import { BaseEntity } from './base.entity'

@Entity('renters')
export class RenterEntity extends BaseEntity {
  @Column()
  name!: string

  @Column()
  lastName!: string

  @Column({ unique: true, nullable: true })
  document!: string

  @Column({ name: 'phone_number' })
  phoneNumber!: string

  @Column({ type: 'varchar', nullable: true })
  email!: string

  @Column({ name: 'marital_status', type: 'enum', enum: EMaritalStatus })
  maritalStatus!: EMaritalStatus

  @OneToOne(() => AccountEntity, (account) => account.renter, {
    nullable: false,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity

  @RelationId((renter: RenterEntity) => renter.account)
  accountId!: string

  @OneToOne(() => AddressEntity, (address) => address.renter, {
    nullable: true,
    cascade: ['insert', 'update'],
    eager: true,
  })
  @JoinColumn({ name: 'address_id' })
  address!: AddressEntity

  @RelationId((renter: RenterEntity) => renter.address)
  addressId!: string

  @OneToMany(() => ContractEntity, (contract) => contract.renter)
  contracts?: ContractEntity[]
}
