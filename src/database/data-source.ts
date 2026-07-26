import 'dotenv/config'
import { DataSource } from 'typeorm'
import { entities } from './entities'

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['src/database/migrations/*.ts'],
  poolSize: 20,
})
