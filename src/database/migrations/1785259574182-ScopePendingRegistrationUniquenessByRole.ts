import { MigrationInterface, QueryRunner } from 'typeorm'

export class ScopePendingRegistrationUniquenessByRole1785259574182 implements MigrationInterface {
  name = 'ScopePendingRegistrationUniquenessByRole1785259574182'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Drop the old single-column unique constraints on email/phoneNumber
    // (whatever their auto-generated names are) without touching the
    // separate unique index on otpId.
    await queryRunner.query(`
      DO $$
      DECLARE
        r RECORD;
      BEGIN
        FOR r IN
          SELECT con.conname
          FROM pg_constraint con
          JOIN pg_class rel ON rel.oid = con.conrelid
          JOIN pg_attribute att
            ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
          WHERE rel.relname = 'pending_registration_users'
            AND con.contype = 'u'
            AND array_length(con.conkey, 1) = 1
            AND att.attname IN ('email', 'phoneNumber')
        LOOP
          EXECUTE format(
            'ALTER TABLE pending_registration_users DROP CONSTRAINT %I',
            r.conname
          );
        END LOOP;
      END $$;
    `)

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_pending_registration_email_role"
      ON pending_registration_users (email, role)
    `)
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_pending_registration_phone_role"
      ON pending_registration_users ("phoneNumber", role)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_pending_registration_email_role"`)
    await queryRunner.query(`DROP INDEX "IDX_pending_registration_phone_role"`)
    await queryRunner.query(`
      ALTER TABLE pending_registration_users
      ADD CONSTRAINT "UQ_pending_registration_email" UNIQUE (email)
    `)
    await queryRunner.query(`
      ALTER TABLE pending_registration_users
      ADD CONSTRAINT "UQ_pending_registration_phone" UNIQUE ("phoneNumber")
    `)
  }
}
