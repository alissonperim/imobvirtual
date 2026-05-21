import type { Property } from '@pkg/types'

export type PropertyDTO = Omit<Property, 'id'>
