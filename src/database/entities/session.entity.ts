import { Column, Entity, JoinColumn, ManyToOne, RelationId } from 'typeorm'
import { AccountEntity } from './account.entity'
import { BaseEntity } from './base.entity'
import { ESessionStatus } from '@pkg/types/Session'

@Entity('sessions')
export class SessionEntity extends BaseEntity {
  @Column({ name: 'token_hash', unique: true })
  tokenHash!: string

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent!: string

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress!: string

  @Column({ name: 'last_logged_at', type: 'timestamp', nullable: true })
  lastLoggedAt!: Date

  @Column({ name: 'device_id', type: 'varchar', nullable: true })
  deviceId!: string

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt!: Date

  @ManyToOne(() => AccountEntity, (account) => account.sessions, {
    nullable: false,
  })
  @JoinColumn({ name: 'account_id' })
  account!: AccountEntity

  @RelationId((session: SessionEntity) => session.account)
  accountId!: string

  @Column({ nullable: false, type: 'enum', enum: ESessionStatus })
  status!: ESessionStatus
}
