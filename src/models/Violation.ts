import { db } from '@/database';
import { Pagination } from '@/models/Base';

export interface ViolationInterface {
  name: string;
  penalty?: string;
}

export interface ViolationEditInterface {
  name: string;
  penalty?: string;
}

class Violation implements ViolationInterface {
  name: string;
  penalty?: string;

  constructor(data: ViolationInterface) {
    this.name = data.name;
    this.penalty = data.penalty;
  }

  static async get(name: string): Promise<Violation> {
    const res = await db.query<ViolationInterface>(
      'SELECT * FROM violations WHERE "name" = $1 LIMIT 1',
      [name],
    );
    if (res.rowCount === 0) {
      throw new Error(`名称为 ${name} 的违章不存在`);
    }
    return new Violation(res.rows[0]);
  }

  static async list(pagination?: Pagination, names?: string[]): Promise<Violation[]> {
    let query = names
      ? 'SELECT * FROM violations WHERE "name" = ANY($1)'
      : 'SELECT * FROM violations';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<ViolationInterface>(query, names ? [names] : []);
    return res.rows.map((row) => new Violation(row));
  }

  static async create(data: ViolationEditInterface): Promise<Violation> {
    const res = await db.query<ViolationInterface>(
      'INSERT INTO violations ("name", "penalty") VALUES ($1, $2) RETURNING *',
      [data.name, data.penalty],
    );
    return new Violation(res.rows[0]);
  }

  async update(data: ViolationEditInterface): Promise<Violation> {
    const res = await db.query<ViolationInterface>(
      'UPDATE violations SET "name" = $1, "penalty" = $2 WHERE "name" = $3 RETURNING *',
      [data.name, data.penalty, this.name],
    );
    return new Violation(res.rows[0]);
  }

  async delete(): Promise<Violation> {
    const res = await db.query<ViolationInterface>(
      'DELETE FROM violations WHERE "name" = $1 RETURNING *',
      [this.name],
    );
    return new Violation(res.rows[0]);
  }
}

export default Violation;
