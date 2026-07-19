import { MigrationInterface, QueryRunner } from 'typeorm'

export class Initial1784426542102 implements MigrationInterface {
  name = 'Initial1784426542102'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."property_charges_charge_amount_type_enum" AS ENUM('percentage', 'absolute')`,
    )
    await queryRunner.query(
      `CREATE TABLE "property_charges" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "amount" numeric(10,2) NOT NULL, "description" character varying(320) NOT NULL, "charge_amount_type" "public"."property_charges_charge_amount_type_enum" NOT NULL, "property_id" character varying(21) NOT NULL, CONSTRAINT "PK_a83ec85ae59eeda4a71f6084d92" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."properties_status_enum" AS ENUM('AVAILABLE', 'RENTED', 'MAINTENANCE')`,
    )
    await queryRunner.query(
      `CREATE TABLE "properties" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "description" character varying, "rent_amount" numeric(10,2) NOT NULL, "solar_energy_active" boolean NOT NULL DEFAULT false, "status" "public"."properties_status_enum" NOT NULL, "owner_id" character varying(21) NOT NULL, "address_id" character varying(21), CONSTRAINT "REL_1467c863029590ab33d4104857" UNIQUE ("address_id"), CONSTRAINT "PK_2d83bfa0b9fcd45dee1785af44d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_cc8c6fb84d7ce4ffdb04975073" ON "properties"  ("owner_id", "status", "deleted_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_8664ff094beddca3794025c571" ON "properties"  ("deleted_at", "created_at") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_9cd2513cd04f57c9967f640b0a" ON "properties"  ("status") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_797b76e2d11a5bf755127d1aa6" ON "properties"  ("owner_id") `,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."contracts_status_enum" AS ENUM('ACTIVE', 'FINISHED', 'CANCELLED')`,
    )
    await queryRunner.query(
      `CREATE TABLE "contracts" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "start_date" TIMESTAMP NOT NULL, "end_date" TIMESTAMP, "rent_amount" numeric(10,2) NOT NULL, "due_day" integer NOT NULL, "status" "public"."contracts_status_enum" NOT NULL, "owner_id" character varying(21) NOT NULL, "renter_id" character varying(21) NOT NULL, "property_id" character varying(21) NOT NULL, CONSTRAINT "PK_2c7b8f3a7b1acdd49497d83d0fb" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."renters_marital_status_enum" AS ENUM('MARIED', 'SINGLE', 'DIVORCED', 'WIDOWER')`,
    )
    await queryRunner.query(
      `CREATE TABLE "renters" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "document" character varying NOT NULL, "phone_number" character varying NOT NULL, "email" character varying, "marital_status" "public"."renters_marital_status_enum" NOT NULL, "account_id" character varying(21), "address_id" character varying(21) NOT NULL, CONSTRAINT "UQ_c5e233aeb91b7bee0c36c31eb0f" UNIQUE ("document"), CONSTRAINT "REL_d5e984b1a14335c33939940ed2" UNIQUE ("account_id"), CONSTRAINT "REL_9671680a49163337756025deea" UNIQUE ("address_id"), CONSTRAINT "PK_6227c974d2f3c7ce77f208147ca" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "addresses" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "street" character varying NOT NULL, "neighborhood" character varying NOT NULL, "postal_code" character varying NOT NULL, "complement" character varying NOT NULL, "city" character varying NOT NULL, "state" character varying NOT NULL, "number" character varying NOT NULL, CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."owners_marital_status_enum" AS ENUM('MARIED', 'SINGLE', 'DIVORCED', 'WIDOWER')`,
    )
    await queryRunner.query(
      `CREATE TABLE "owners" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "name" character varying NOT NULL, "document" character varying NOT NULL, "phone_number" character varying NOT NULL, "email" character varying, "marital_status" "public"."owners_marital_status_enum" NOT NULL, "account_id" character varying(21) NOT NULL, "address_id" character varying(21) NOT NULL, CONSTRAINT "UQ_dce1d2a570c1d8eb7db6e01f374" UNIQUE ("document"), CONSTRAINT "REL_b2e0d933f5d82d13aae5380d9a" UNIQUE ("account_id"), CONSTRAINT "REL_78a3211ef8814eb7f6258429ec" UNIQUE ("address_id"), CONSTRAINT "PK_42838282f2e6b216301a70b02d6" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "sessions" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "token_hash" character varying NOT NULL, "user_agent" character varying, "ip_address" character varying, "last_logged_at" TIMESTAMP, "device_id" character varying, "expires_at" TIMESTAMP NOT NULL, "revoked_at" TIMESTAMP, "account_id" character varying(21) NOT NULL, CONSTRAINT "UQ_abaa9e068cdd390bc5210f79884" UNIQUE ("token_hash"), CONSTRAINT "PK_3238ef96f18b355b671619111bc" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."otp_challenges_purpose_enum" AS ENUM('SIGN_IN', 'SIGN_UP', 'CHANGE_EMAIL', 'CHANGE_PHONE', 'PASSWORD_RECOVERY')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."otp_challenges_channel_enum" AS ENUM('SMS', 'WHATSAPP')`,
    )
    await queryRunner.query(
      `CREATE TABLE "otp_challenges" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "destination" character varying NOT NULL, "purpose" "public"."otp_challenges_purpose_enum" NOT NULL, "channel" "public"."otp_challenges_channel_enum" NOT NULL, "code_hash" character varying NOT NULL, "expires_at" TIMESTAMP NOT NULL, "attempts" integer NOT NULL DEFAULT '0', "consumed_at" TIMESTAMP, "account_id" character varying(21), CONSTRAINT "PK_c34f21df6c8aa51229715452068" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_role_enum" AS ENUM('OWNER', 'RENTER')`,
    )
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_status_enum" AS ENUM('ACTIVE', 'BLOCKED', 'PENDING')`,
    )
    await queryRunner.query(
      `CREATE TABLE "accounts" ("created_by" character varying, "updated_by" character varying, "deleted_by" character varying, "id" character varying(21) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "phone_number" character varying NOT NULL, "role" "public"."accounts_role_enum" NOT NULL, "status" "public"."accounts_status_enum" NOT NULL, "last_login_at" TIMESTAMP, CONSTRAINT "UQ_31719ad17bc34678f49decea7de" UNIQUE ("phone_number"), CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "property_charges" ADD CONSTRAINT "FK_d893cbcc5b3960e528a25fcbf0d" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "properties" ADD CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "properties" ADD CONSTRAINT "FK_1467c863029590ab33d41048577" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_edab3841e395df407bf9118979b" FOREIGN KEY ("owner_id") REFERENCES "owners"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_5e08771635341f26ba31ee6a877" FOREIGN KEY ("renter_id") REFERENCES "renters"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "contracts" ADD CONSTRAINT "FK_5d074ef9e0a3c47bace58d850b0" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "renters" ADD CONSTRAINT "FK_d5e984b1a14335c33939940ed20" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "renters" ADD CONSTRAINT "FK_9671680a49163337756025deea7" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "owners" ADD CONSTRAINT "FK_b2e0d933f5d82d13aae5380d9a6" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "owners" ADD CONSTRAINT "FK_78a3211ef8814eb7f6258429ece" FOREIGN KEY ("address_id") REFERENCES "addresses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "sessions" ADD CONSTRAINT "FK_da0cf19646ff5c6e3c0284468e5" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "otp_challenges" ADD CONSTRAINT "FK_a28908edfa10904711b3c3db999" FOREIGN KEY ("account_id") REFERENCES "accounts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "otp_challenges" DROP CONSTRAINT "FK_a28908edfa10904711b3c3db999"`,
    )
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_da0cf19646ff5c6e3c0284468e5"`,
    )
    await queryRunner.query(
      `ALTER TABLE "owners" DROP CONSTRAINT "FK_78a3211ef8814eb7f6258429ece"`,
    )
    await queryRunner.query(
      `ALTER TABLE "owners" DROP CONSTRAINT "FK_b2e0d933f5d82d13aae5380d9a6"`,
    )
    await queryRunner.query(
      `ALTER TABLE "renters" DROP CONSTRAINT "FK_9671680a49163337756025deea7"`,
    )
    await queryRunner.query(
      `ALTER TABLE "renters" DROP CONSTRAINT "FK_d5e984b1a14335c33939940ed20"`,
    )
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_5d074ef9e0a3c47bace58d850b0"`,
    )
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_5e08771635341f26ba31ee6a877"`,
    )
    await queryRunner.query(
      `ALTER TABLE "contracts" DROP CONSTRAINT "FK_edab3841e395df407bf9118979b"`,
    )
    await queryRunner.query(
      `ALTER TABLE "properties" DROP CONSTRAINT "FK_1467c863029590ab33d41048577"`,
    )
    await queryRunner.query(
      `ALTER TABLE "properties" DROP CONSTRAINT "FK_797b76e2d11a5bf755127d1aa67"`,
    )
    await queryRunner.query(
      `ALTER TABLE "property_charges" DROP CONSTRAINT "FK_d893cbcc5b3960e528a25fcbf0d"`,
    )
    await queryRunner.query(`DROP TABLE "accounts"`)
    await queryRunner.query(`DROP TYPE "public"."accounts_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."accounts_role_enum"`)
    await queryRunner.query(`DROP TABLE "otp_challenges"`)
    await queryRunner.query(`DROP TYPE "public"."otp_challenges_channel_enum"`)
    await queryRunner.query(`DROP TYPE "public"."otp_challenges_purpose_enum"`)
    await queryRunner.query(`DROP TABLE "sessions"`)
    await queryRunner.query(`DROP TABLE "owners"`)
    await queryRunner.query(`DROP TYPE "public"."owners_marital_status_enum"`)
    await queryRunner.query(`DROP TABLE "addresses"`)
    await queryRunner.query(`DROP TABLE "renters"`)
    await queryRunner.query(`DROP TYPE "public"."renters_marital_status_enum"`)
    await queryRunner.query(`DROP TABLE "contracts"`)
    await queryRunner.query(`DROP TYPE "public"."contracts_status_enum"`)
    await queryRunner.query(
      `DROP INDEX "public"."IDX_797b76e2d11a5bf755127d1aa6"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_9cd2513cd04f57c9967f640b0a"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8664ff094beddca3794025c571"`,
    )
    await queryRunner.query(
      `DROP INDEX "public"."IDX_cc8c6fb84d7ce4ffdb04975073"`,
    )
    await queryRunner.query(`DROP TABLE "properties"`)
    await queryRunner.query(`DROP TYPE "public"."properties_status_enum"`)
    await queryRunner.query(`DROP TABLE "property_charges"`)
    await queryRunner.query(
      `DROP TYPE "public"."property_charges_charge_amount_type_enum"`,
    )
  }
}
