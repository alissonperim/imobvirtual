import { Otp } from '@pkg/types'
import { OtpCreateRepositoryInput } from '../domain/otp'

export interface IOtpChallengesRepository {
  create(params: OtpCreateRepositoryInput): Promise<Otp>
}
