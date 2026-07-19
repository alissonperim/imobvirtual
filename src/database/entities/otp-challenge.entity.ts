import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { EOtpChannel, EOtpPurpose } from '@pkg/types'
import { AccountEntity } from './account.entity'
import { BaseEntity } from './base.entity'

@Entity('otp_challenges')
export class OtpChallengeEntity extends BaseEntity {
  @Column()
  destination!: string

  @Column({ type: 'enum', enum: EOtpPurpose })
  purpose!: EOtpPurpose

  @Column({ type: 'enum', enum: EOtpChannel })
  channel!: EOtpChannel

  @Column({ name: 'code_hash' })
  codeHash!: string

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date

  @Column({ default: 0 })
  attempts!: number

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt!: Date | null

  @ManyToOne(() => AccountEntity, (account) => account.otps, {
    nullable: true,
  })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity | null

  @RelationId((otp: OtpChallengeEntity) => otp.account)
  accountId!: string | null
}
