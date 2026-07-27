import { Otp } from '@pkg/types'
import { OtpCreateRepositoryInput } from '../domain/otp'

export interface IOtpRepository {
  create(params: OtpCreateRepositoryInput): Promise<Otp>
  consumeActiveByAccountId(accountId: string): Promise<void>
  findActiveById(id: string): Promise<Otp | undefined>
  incrementAttempts(id: string): Promise<void>
  consume(id: string): Promise<void>
}
