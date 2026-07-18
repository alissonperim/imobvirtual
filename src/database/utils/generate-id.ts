import { randomInt } from 'node:crypto'

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'
const ID_LENGTH = 21

export function generateId(): string {
  let id = ''
  for (let i = 0; i < ID_LENGTH; i++) {
    id += ALPHABET[randomInt(ALPHABET.length)]
  }
  return id
}
