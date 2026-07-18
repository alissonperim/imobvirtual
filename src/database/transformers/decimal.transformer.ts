import type { ValueTransformer } from 'typeorm'

export const decimalTransformer: ValueTransformer = {
  to: (value?: number): number | undefined => value,
  from: (value?: string): number | undefined =>
    value === null || value === undefined ? value : Number(value),
}
