import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm'
import { EOtpChannel, EOtpPurpose } from '@pkg/types'
import { generateId } from '../utils/generate-id'
import { AccountEntity } from './account.entity'

@Entity('otp_challenges')
export class OtpChallengeEntity {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  id: string

  @Column()
  destination: string

  @Column({ type: 'enum', enum: EOtpPurpose })
  purpose: EOtpPurpose

  @Column({ type: 'enum', enum: EOtpChannel })
  channel: EOtpChannel

  @Column({ name: 'code_hash' })
  codeHash: string

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @Column({ default: 0 })
  attempts: number

  @Column({ name: 'consumed_at', type: 'timestamp', nullable: true })
  consumedAt: Date | null

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

  @ManyToOne(() => AccountEntity, (account) => account.otps, {
    nullable: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity | null

  @RelationId((otp: OtpChallengeEntity) => otp.account)
  accountId: string | null

  @BeforeInsert()
  assignGeneratedId() {
    if (!this.id) {
      this.id = generateId()
    }
  }
}
