import type { UpdateResult } from 'typeorm'

export const wasAffected = (result: UpdateResult): boolean => {
  return (result.affected ?? 0) > 0
}
