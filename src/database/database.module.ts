import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { entities } from './entities'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities,
      migrations: ['dist/database/migrations/*.js'],
      migrationsRun: false,
      synchronize: false,
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
