import { Column, Entity, Index } from 'typeorm'
import { BaseEntity } from './base.entity'
import { EAccountRole } from '@pkg/types'

@Entity('pending_registration_users')
export class PendingRegistrationEntity extends BaseEntity {
  @Column({ nullable: false, unique: true })
  email!: string

  @Column({ nullable: false, unique: true })
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
