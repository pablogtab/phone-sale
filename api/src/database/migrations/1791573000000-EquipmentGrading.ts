import { MigrationInterface, QueryRunner } from 'typeorm';
export class EquipmentGrading1791573000000 implements MigrationInterface {
  async up(q: QueryRunner): Promise<void> {
    await q.query(
      'CREATE TABLE equipment_grading (id SERIAL PRIMARY KEY, code varchar NOT NULL UNIQUE, description varchar NOT NULL, "index" integer NOT NULL)',
    );
    await q.query(
      'ALTER TABLE devices ADD COLUMN "gradingId" integer REFERENCES equipment_grading(id)',
    );
  }
  async down(q: QueryRunner): Promise<void> {
    await q.query('ALTER TABLE devices DROP COLUMN "gradingId"');
    await q.query('DROP TABLE equipment_grading');
  }
}
