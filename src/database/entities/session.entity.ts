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
import { generateId } from '../utils/generate-id'
import { AccountEntity } from './account.entity'

@Entity('sessions')
export class SessionEntity {
  @PrimaryColumn({ type: 'varchar', length: 21 })
  id: string

  @Column({ name: 'token_hash', unique: true })
  tokenHash: string

  @Column({ name: 'user_agent', type: 'varchar', nullable: true })
  userAgent: string | null

  @Column({ name: 'ip_address', type: 'varchar', nullable: true })
  ipAddress: string | null

  @Column({ name: 'last_logged_at', type: 'timestamp', nullable: true })
  lastLoggedAt: Date | null

  @Column({ name: 'device_id', type: 'varchar', nullable: true })
  deviceId: string | null

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt: Date

  @Column({ name: 'revoked_at', type: 'timestamp', nullable: true })
  revokedAt: Date | null

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null

  @ManyToOne(() => AccountEntity, (account) => account.sessions, {
    nullable: false,
  })
  @JoinColumn({ name: 'account_id' })
  account: AccountEntity

  @RelationId((session: SessionEntity) => session.account)
  accountId: string

  @BeforeInsert()
  assignGeneratedId() {
    if (!this.id) {
      this.id = generateId()
    }
  }
}
