import {
  Column,
  Entity,
  Index,
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
  @Column({ length: 160, type: 'varchar' })
  name!: string

  @Column({ name: 'last_name', length: 120, type: 'varchar' })
  lastName!: string

  @Column({ unique: true })
  @Index('idx_doument')
  document!: string

  @Column({ name: 'phone_number' })
  phoneNumber!: string

  @Column({ type: 'varchar', nullable: true })
  email!: string | null

  @Column({
    name: 'marital_status',
    type: 'enum',
    enum: EMaritalStatus,
    nullable: true,
  })
  maritalStatus!: EMaritalStatus

  @OneToOne(() => AccountEntity, (account) => account.owner, {
    nullable: false,
    cascade: ['insert', 'update', 'soft-remove'],
  })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity

  @RelationId((owner: OwnerEntity) => owner.account)
  accountId!: string

  @OneToOne(() => AddressEntity, (address) => address.owner, {
    nullable: true,
    eager: true,
    cascade: ['insert', 'update'],
  })
  @JoinColumn({ name: 'address_id' })
  address!: AddressEntity

  @RelationId((owner: OwnerEntity) => owner.address)
  addressId!: string

  @OneToMany(() => PropertyEntity, (property) => property.owner, {
    nullable: true,
  })
  properties?: PropertyEntity[]

  @OneToMany(() => ContractEntity, (contract) => contract.owner, {
    nullable: true,
  })
  contracts?: ContractEntity[]

  get fullName(): string {
    return `${this.name} ${this.lastName}`
  }
}
