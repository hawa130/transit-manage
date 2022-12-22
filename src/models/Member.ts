import { db } from '@/database';
import Route, { RouteInterface } from '@/models/Route';
import { Pagination } from '@/models/Base';

export type GenderType = '男' | '女';

export interface MemberInterface {
  id: number;
  name: string;
  gender: GenderType;
  birthYear: number;
  origin: string;
  joinedAt: Date;
  phone: string;
  idNumber: string;
  job: string;
  routeId?: number;
}

export interface MemberEditInterface {
  name: string;
  gender: GenderType;
  birthYear: number;
  origin: string;
  joinedAt?: Date;
  phone: string;
  idNumber: string;
  routeId?: number;
}

class Member implements MemberInterface {
  id: number;
  name: string;
  gender: GenderType;
  birthYear: number;
  origin: string;
  joinedAt: Date;
  phone: string;
  idNumber: string;
  job: string;
  routeId?: number;

  constructor(data: MemberInterface) {
    this.id = data.id;
    this.name = data.name;
    this.gender = data.gender;
    this.birthYear = data.birthYear;
    this.origin = data.origin;
    this.joinedAt = data.joinedAt;
    this.phone = data.phone;
    this.idNumber = data.idNumber;
    this.job = data.job;
    this.routeId = data.routeId;
  }

  static async get(id: number): Promise<Member> {
    const res = await db.query<MemberInterface>(
      'SELECT * FROM members WHERE "id" = $1 LIMIT 1',
      [id],
    );
    if (res.rowCount === 0) {
      throw new Error(`工号为 ${id} 的员工不存在`);
    }
    return new Member(res.rows[0]);
  }

  static async list(pagination?: Pagination, ids?: number[]): Promise<Member[]> {
    let query = ids
      ? `SELECT *
         FROM members
         WHERE "id" = ANY ($1)
         ORDER BY "joinedAt" DESC`
      : `SELECT *
         FROM members
         ORDER BY "joinedAt" DESC`;
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${size * (page - 1)}::int`;
    }
    const res = await db.query(query, ids ? [ids] : []);
    return res.rows;
  }

  static async listByFleet(fleetId: number, pagination?: Pagination): Promise<Member[]> {
    let query = 'SELECT * FROM members WHERE "routeId" IN (SELECT "id" FROM routes WHERE "fleetId" = $1)';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${size * (page - 1)}::int`;
    }
    const res = await db.query<MemberInterface>(query, [fleetId]);
    return res.rows.map((row) => new Member(row));
  }

  static async create(data: MemberEditInterface): Promise<Member> {
    const res = await db.query<MemberInterface>(
      `INSERT INTO members ("name", "gender", "birthYear", "origin", "joinedAt", "phone", "idNumber", "job", "routeId")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [data.name, data.gender, data.birthYear, data.origin, data.joinedAt ?? new Date(), data.phone, data.idNumber, '司机', data.routeId],
    );
    return new Member(res.rows[0]);
  }

  async update(data: MemberEditInterface): Promise<Member> {
    const res = await db.query<MemberInterface>(
      `UPDATE members
       SET "name"      = $1,
           "gender"    = $2,
           "birthYear" = $3,
           "origin"    = $4,
           "joinedAt"  = $5,
           "phone"     = $6,
           "idNumber"  = $7,
           "routeId"   = $8
       WHERE "id" = $9
       RETURNING *`,
      [
        data.name,
        data.gender,
        data.birthYear,
        data.origin,
        data.joinedAt ?? new Date(),
        data.phone,
        data.idNumber,
        data.routeId,
        this.id,
      ],
    );
    return new Member(res.rows[0]);
  }

  async delete(): Promise<Member> {
    const res = await db.query<MemberInterface>(
      'DELETE FROM members WHERE "id" = $1 RETURNING *',
      [this.id],
    );
    return new Member(res.rows[0]);
  }

  async route(): Promise<Route> {
    if (!this.routeId) {
      throw new Error('员工未分配线路');
    }
    const res = await db.query<RouteInterface>(
      'SELECT * FROM routes WHERE "id" = $1 LIMIT 1',
      [this.routeId],
    );
    return new Route(res.rows[0]);
  }

  static async getRoute(id?: number): Promise<Route> {
    if (!id) {
      throw new Error('未分配线路');
    }
    return await Route.get(id);
  }
}

export default Member;
