import { Base } from './Base'

export enum EPropertyChargeAmountType {
  percentage = 'percentage',
  absolute = 'absolute',
}

export type PropertyCharge = Base & {
  description: string
  amount: number
  chargeAmountType: EPropertyChargeAmountType
}
