import { AccountEntity } from './account.entity'
import { AddressEntity } from './address.entity'
import { OwnerEntity } from './owner.entity'
import { RenterEntity } from './renter.entity'
import { PropertyEntity } from './property.entity'
import { ContractEntity } from './contract.entity'
import { SessionEntity } from './session.entity'
import { OtpChallengeEntity } from './otp-challenge.entity'
import { PropertyChargeEntity } from './property-charge.entity'

export * from './account.entity'
export * from './address.entity'
export * from './owner.entity'
export * from './renter.entity'
export * from './property.entity'
export * from './contract.entity'
export * from './session.entity'
export * from './otp-challenge.entity'

export const entities = [
  AccountEntity,
  AddressEntity,
  OwnerEntity,
  RenterEntity,
  PropertyEntity,
  ContractEntity,
  SessionEntity,
  OtpChallengeEntity,
  PropertyChargeEntity,
]
