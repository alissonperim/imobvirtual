import { Column, Entity, OneToMany, OneToOne } from 'typeorm'
import { EAccountRole, EAccountStatus } from '@pkg/types'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { SessionEntity } from './session.entity'
import { OtpChallengeEntity } from './otp-challenge.entity'
import { BaseEntity } from './base.entity'

@Entity('accounts')
export class AccountEntity extends BaseEntity {
  @Column({ name: 'phone_number', unique: true })
  phoneNumber!: string

  @Column({ type: 'enum', enum: EAccountRole })
  role!: EAccountRole

  @Column({ type: 'enum', enum: EAccountStatus })
  status!: EAccountStatus

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt!: Date | null

  @OneToOne(() => OwnerEntity, (owner) => owner.account)
  owner?: OwnerEntity

  @OneToOne(() => RenterEntity, (renter) => renter.account)
  renter?: RenterEntity

  @OneToMany(() => SessionEntity, (session) => session.account)
  sessions?: SessionEntity[]

  @OneToMany(() => OtpChallengeEntity, (otp) => otp.account)
  otps?: OtpChallengeEntity[]
}
