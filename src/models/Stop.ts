import { db } from '@/database';
import format from 'pg-format';
import { Pagination } from '@/models/Base';

export interface StopInterface {
  name: string;
  location: string;
}

export interface StopEditInterface {
  name: string;
  location: string;
}

class Stop implements StopInterface {
  name: string;
  location: string;

  constructor(data: StopInterface) {
    this.name = data.name;
    this.location = data.location;
  }

  static async get(name: string): Promise<Stop> {
    const res = await db.query<StopInterface>(
      'SELECT * FROM stops WHERE "name" = $1 LIMIT 1',
      [name],
    );
    if (res.rowCount === 0) {
      throw new Error(`名称为 ${name} 的站点不存在`);
    }
    return new Stop(res.rows[0]);
  }

  static async list(pagination?: Pagination, names?: string[]): Promise<Stop[]> {
    let query = names
      ? 'SELECT * FROM stops WHERE "name" = ANY($1)'
      : 'SELECT * FROM stops';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<StopInterface>(query, names ? [names] : []);
    return res.rows.map((row) => new Stop(row));
  }

  static async create(data: StopEditInterface): Promise<Stop> {
    const res = await db.query<StopInterface>(
      'INSERT INTO stops ("name", "location") VALUES ($1, $2) RETURNING *',
      [data.name, data.location],
    );
    return new Stop(res.rows[0]);
  }

  async update(data: StopEditInterface): Promise<Stop> {
    const res = await db.query<StopInterface>(
      'UPDATE stops SET "name" = $1, "location" = $2 WHERE "name" = $3 RETURNING *',
      [data.name, data.location, this.name],
    );
    return new Stop(res.rows[0]);
  }

  async delete(): Promise<Stop> {
    const res = await db.query<StopInterface>(
      'DELETE FROM stops WHERE "name" = $1 RETURNING *',
      [this.name],
    );
    return new Stop(res.rows[0]);
  }
}

export default Stop;
