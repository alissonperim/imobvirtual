import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm'
import { EAccountRole, EAccountStatus } from '@pkg/types'
import { generateId } from '../utils/generate-id'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { SessionEntity } from './session.entity'
import { OtpChallengeEntity } from './otp-challenge.entity'

@Entity('accounts')
export class AccountEntity {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  id: string

  @Column({ name: 'phone_number', unique: true })
  phoneNumber: string

  @Column({ type: 'enum', enum: EAccountRole })
  role: EAccountRole

  @Column({ type: 'enum', enum: EAccountStatus })
  status: EAccountStatus

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt: Date | null

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

  @OneToOne(() => OwnerEntity, (owner) => owner.account)
  owner?: OwnerEntity

  @OneToOne(() => RenterEntity, (renter) => renter.account)
  renter?: RenterEntity

  @OneToMany(() => SessionEntity, (session) => session.account)
  sessions?: SessionEntity[]

  @OneToMany(() => OtpChallengeEntity, (otp) => otp.account)
  otps?: OtpChallengeEntity[]

  @BeforeInsert()
  assignGeneratedId() {
    if (!this.id) {
      this.id = generateId()
    }
  }
}
