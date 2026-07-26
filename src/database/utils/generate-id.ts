import { customAlphabet } from 'nanoid'

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export function generateId(): string {
  const nanoid = customAlphabet(ALPHABET, 24)

  return nanoid()
}
