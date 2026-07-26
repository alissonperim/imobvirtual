import { Column, Entity, OneToMany, OneToOne, RelationId } from 'typeorm'
import { EAccountRole, EAccountStatus } from '@pkg/types'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { SessionEntity } from './session.entity'
import { OtpChallengeEntity } from './otp-challenge.entity'
import { BaseEntity } from './base.entity'

@Entity('accounts')
export class AccountEntity extends BaseEntity {
  @Column({ type: 'enum', enum: EAccountRole })
  role!: EAccountRole

  @Column({ type: 'enum', enum: EAccountStatus })
  status!: EAccountStatus

  @OneToOne(() => OwnerEntity, (owner) => owner.account, { nullable: true })
  owner!: OwnerEntity

  @RelationId((account: AccountEntity) => account.owner)
  ownerId?: string

  @OneToOne(() => RenterEntity, (renter) => renter.account, { nullable: true })
  renter!: RenterEntity

  @RelationId((account: AccountEntity) => account.renter)
  renterId?: string

  @OneToMany(() => SessionEntity, (session) => session.account)
  sessions!: SessionEntity[]

  @OneToMany(() => OtpChallengeEntity, (otp) => otp.account)
  otps!: OtpChallengeEntity[]
}
