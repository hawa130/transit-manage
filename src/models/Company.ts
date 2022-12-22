import { db } from '@/database';
import { Pagination } from '@/models/Base';

export interface CompanyInterface {
  id: number;
  name: string;
  place?: string;
  createdAt: Date;
}

export interface CompanyEditInterface {
  name: string;
  place?: string;
  createdAt?: Date;
}

class Company implements CompanyInterface {
  id: number;
  name: string;
  place?: string;
  createdAt: Date;

  constructor(data: CompanyInterface) {
    this.id = data.id;
    this.name = data.name;
    this.place = data.place;
    this.createdAt = data.createdAt;
  }

  static async get(id: number): Promise<Company> {
    const res = await db.query<CompanyInterface>(
      'SELECT * FROM companies WHERE "id" = $1 LIMIT 1',
      [id]
    )
    if (res.rowCount === 0) {
      throw new Error(`编号为 ${id} 的公司不存在`);
    }
    return new Company(res.rows[0]);
  }

  static async list(pagination?: Pagination, ids?: number[]): Promise<Company[]> {
    let query = ids
      ? 'SELECT * FROM companies WHERE "id" = ANY($1) ORDER BY "createdAt" DESC'
      : 'SELECT * FROM companies ORDER BY "createdAt" DESC';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<CompanyInterface>(query, ids ? [ids] : []);
    return res.rows.map((row) => new Company(row));
  }

  static async create(data: CompanyEditInterface): Promise<Company> {
    const res = await db.query<CompanyInterface>(
      'INSERT INTO companies ("name", "place", "createdAt") VALUES ($1, $2, $3) RETURNING *',
      [data.name, data.place, data.createdAt ?? new Date()]
    );
    return new Company(res.rows[0]);
  }

  async update(data: CompanyEditInterface): Promise<Company> {
    const res = await db.query<CompanyInterface>(
      'UPDATE companies SET "name" = $1, "place" = $2, "createdAt" = $3 WHERE "id" = $4 RETURNING *',
      [data.name, data.place, data.createdAt ?? new Date(), this.id]
    );
    return new Company(res.rows[0]);
  }

  async delete(): Promise<Company> {
    const res = await db.query<CompanyInterface>(
      'DELETE FROM companies WHERE "id" = $1 RETURNING *',
      [this.id]
    );
    return new Company(res.rows[0]);
  }
}

export default Company;
