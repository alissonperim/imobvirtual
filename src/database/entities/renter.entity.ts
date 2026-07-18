import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { EMaritalStatus } from '@pkg/types'
import { generateId } from '../utils/generate-id'
import { AccountEntity } from './account.entity'
import { AddressEntity } from './address.entity'
import { ContractEntity } from './contract.entity'

@Entity('renters')
export class RenterEntity {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  id: string

  @Column()
  name: string

  @Column({ unique: true })
  document: string

  @Column({ name: 'phone_number' })
  phoneNumber: string

  @Column({ type: 'varchar', nullable: true })
  email: string | null

  @Column({ name: 'marital_status', type: 'enum', enum: EMaritalStatus })
  maritalStatus: EMaritalStatus

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

  @OneToOne(() => AccountEntity, (account) => account.renter, {
    nullable: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity | null

  @RelationId((renter: RenterEntity) => renter.account)
  accountId: string | null

  @OneToOne(() => AddressEntity, (address) => address.renter, {
    nullable: false,
  })
  @JoinColumn({ name: 'address_id' })
  address: AddressEntity

  @RelationId((renter: RenterEntity) => renter.address)
  addressId: string

  @OneToMany(() => ContractEntity, (contract) => contract.renter)
  contracts?: ContractEntity[]

  @BeforeInsert()
  assignGeneratedId() {
    if (!this.id) {
      this.id = generateId()
    }
  }
}
