import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { entities } from './entities'
import { TypeOrmTransactionManager } from './transaction/implementation/typeorm-transaction-manager'

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
  providers: [
    { provide: 'TRANSACTION_MANAGER', useClass: TypeOrmTransactionManager },
  ],
  exports: [TypeOrmModule, 'TRANSACTION_MANAGER'],
})
export class DatabaseModule {}
