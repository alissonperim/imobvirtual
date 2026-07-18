import { Prisma } from '@db-config/generated/client'

export const isP2025 = (e: unknown): boolean => {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025'
}
