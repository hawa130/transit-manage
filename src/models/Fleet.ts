import { db } from '@/database';
import Company, { CompanyInterface } from '@/models/Company';
import Member, { MemberInterface } from '@/models/Member';
import { Pagination } from '@/models/Base';

export interface FleetInterface {
  id: number;
  name?: string;
  companyId?: number;
  captainId?: number;
  createdAt: Date;
}

export interface FleetEditInterface {
  name?: string;
  companyId?: number;
  captainId?: number;
  createdAt?: Date;
}

class Fleet implements FleetInterface {
  id: number;
  name?: string;
  companyId?: number;
  captainId?: number;
  createdAt: Date;

  constructor(data: FleetInterface) {
    this.id = data.id;
    this.name = data.name;
    this.companyId = data.companyId;
    this.captainId = data.captainId;
    this.createdAt = data.createdAt;
  }

  static async get(id: number): Promise<Fleet> {
    const res = await db.query<Fleet>(
      'SELECT * FROM fleets WHERE "id" = $1 LIMIT 1',
      [id]
    );
    if (res.rowCount === 0) {
      throw new Error(`编号为 ${id} 的车队不存在`);
    }
    return res.rows[0];
  }

  static async getByCaptain(id: number): Promise<Fleet> {
    const res = await db.query<FleetInterface>(
      'SELECT * FROM fleets WHERE "captainId" = $1 LIMIT 1',
      [id]
    );
    if (res.rowCount === 0) {
      throw new Error(`无队长编号为 ${id} 的车队`);
    }
    return new Fleet(res.rows[0]);
  }

  static async list(pagination?: Pagination, ids?: number[]): Promise<Fleet[]> {
    let query = ids
      ? 'SELECT * FROM fleets WHERE "id" = ANY($1) ORDER BY "createdAt" DESC'
      : 'SELECT * FROM fleets ORDER BY "createdAt" DESC';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<FleetInterface>(query, ids ? [ids] : []);
    return res.rows.map((fleet) => new Fleet(fleet));
  }

  static async create(data: FleetEditInterface): Promise<Fleet> {
    const res = await db.query<FleetInterface>(
      'INSERT INTO fleets ("name", "companyId", "captainId", "createdAt") VALUES ($1, $2, $3, $4) RETURNING *',
      [data.name, data.companyId, data.captainId, data.createdAt ?? new Date()]
    );
    return new Fleet(res.rows[0]);
  }

  async update(data: FleetEditInterface): Promise<Fleet> {
    const res = await db.query<FleetInterface>(
      'UPDATE fleets SET "name" = $1, "companyId" = $2, "captainId" = $3, "createdAt" = $4 WHERE "id" = $5 RETURNING *',
      [data.name, data.companyId, data.captainId, data.createdAt ?? new Date(), this.id]
    );
    return new Fleet(res.rows[0]);
  }

  async delete(): Promise<Fleet> {
    const res = await db.query<FleetInterface>(
      'DELETE FROM fleets WHERE "id" = $1 RETURNING *',
      [this.id]
    );
    return new Fleet(res.rows[0]);
  }

  async company(): Promise<Company> {
    if (!this.companyId) {
      throw new Error('车队没有所属公司');
    }
    const res = await db.query<CompanyInterface>(
      'SELECT * FROM companies WHERE "id" = $1 LIMIT 1',
      [this.companyId]
    );
    return new Company(res.rows[0]);
  }

  static async getCompany(id?: number): Promise<Company> {
    if (!id) {
      throw new Error('无所属公司');
    }
    return await Company.get(id);
  }

  async captain(): Promise<Member> {
    if (!this.captainId) {
      throw new Error('车队未分配队长');
    }
    const res = await db.query<MemberInterface>(
      'SELECT * FROM members WHERE "id" = $1 LIMIT 1',
      [this.captainId]
    );
    return new Member(res.rows[0]);
  }

  static async getCaptain(id?: number): Promise<Member> {
    if (!id) {
      throw new Error('无队长');
    }
    return await Member.get(id);
  }
}

export default Fleet;
