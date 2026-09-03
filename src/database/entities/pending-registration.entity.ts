import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from './base.entity'
import { EAccountRole } from '@pkg/types'

@Entity('pending_registration_users')
@Index(['email', 'role'], { unique: true })
@Index(['phoneNumber', 'role'], { unique: true })
export class PendingRegistrationEntity extends BaseEntity {
  @Column({ nullable: false })
  email!: string

  @Column({ nullable: false })
  phoneNumber!: string

  @Column({ nullable: false })
  name!: string

  @Column({ nullable: false })
  lastName!: string

  @Column({ type: 'enum', enum: EAccountRole, nullable: true })
  role!: EAccountRole

  @Column({ nullable: false })
  @Index({ unique: true })
  otpId!: string
}
