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

@Entity('renters')
export class RenterEntity {
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

  @OneToOne(() => AccountEntity, (account) => account.renter, {
    nullable: true,
  })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity | null

  @RelationId((renter: RenterEntity) => renter.account)
  accountId!: string | null

  @OneToOne(() => AddressEntity, (address) => address.renter, {
    nullable: false,
  })
  @JoinColumn({ name: 'address_id' })
  address!: AddressEntity

  @RelationId((renter: RenterEntity) => renter.address)
  addressId!: string

  @OneToMany(() => ContractEntity, (contract) => contract.renter)
  contracts?: ContractEntity[]
}
