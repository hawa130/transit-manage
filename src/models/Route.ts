import Fleet, { FleetInterface } from '@/models/Fleet';
import { db } from '@/database';
import Member, { MemberInterface } from '@/models/Member';
import { Pagination } from '@/models/Base';

export interface RouteInterface {
  id: number;
  fleetId?: number;
  captainId?: number;
  createdAt: Date;
}

export interface RouteEditInterface {
  fleetId?: number;
  captainId?: number;
  createdAt?: Date;
}

class Route implements RouteInterface {
  id: number;
  fleetId?: number;
  captainId?: number;
  createdAt: Date;

  constructor(data: RouteInterface) {
    this.id = data.id;
    this.fleetId = data.fleetId;
    this.captainId = data.captainId;
    this.createdAt = data.createdAt;
  }

  static async get(id: number): Promise<Route> {
    const res = await db.query<RouteInterface>(
      'SELECT * FROM routes WHERE "id" = $1 LIMIT 1',
      [id],
    );
    if (res.rowCount === 0) {
      throw new Error(`编号为 ${id} 的线路不存在`);
    }
    return new Route(res.rows[0]);
  }

  static async list(pagination?: Pagination, ids?: number[]): Promise<Route[]> {
    let query = ids
      ? 'SELECT * FROM routes WHERE "id" = ANY($1) ORDER BY "createdAt" DESC'
      : 'SELECT * FROM routes ORDER BY "createdAt" DESC';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<RouteInterface>(query, ids ? [ids] : []);
    return res.rows.map((row) => new Route(row));
  }

  static async create(data: RouteEditInterface): Promise<Route> {
    const res = await db.query<RouteInterface>(
      'INSERT INTO routes ("fleetId", "captainId", "createdAt") VALUES ($1, $2, $3) RETURNING *',
      [data.fleetId, data.captainId, data.createdAt ?? new Date()],
    );
    return new Route(res.rows[0]);
  }

  async addStops(stops: string[]): Promise<void> {
    await db.query(
      'INSERT INTO stop_routes ("routeId", "stopName", "id") VALUES ' +
        stops.map((_, i) => `($1, $${i + 2}), ${i + 1}`).join(', '),
      [this.id, ...stops]
    );
  }

  async update(data: RouteEditInterface): Promise<Route> {
    const res = await db.query<RouteInterface>(
      'UPDATE routes SET "fleetId" = $1, "captainId" = $2, "createdAt" = $3 WHERE "id" = $4 RETURNING *',
      [data.fleetId, data.captainId, data.createdAt ?? new Date(), this.id],
    );
    return new Route(res.rows[0]);
  }

  async delete(): Promise<Route> {
    const res = await db.query<RouteInterface>(
      'DELETE FROM routes WHERE "id" = $1 RETURNING *',
      [this.id]
    );
    return new Route(res.rows[0]);
  }

  async fleet(): Promise<Fleet> {
    if (!this.fleetId) {
      throw new Error('线路没有所属车队');
    }
    const res = await db.query<FleetInterface>(
      'SELECT * FROM fleets WHERE "id" = $1 LIMIT 1',
      [this.fleetId]
    );
    return new Fleet(res.rows[0]);
  }

  static async getFleet(id?: number): Promise<Fleet> {
    if (!id) {
      throw new Error('无所属车队');
    }
    return Fleet.get(id);
  }

  async captain(): Promise<Member> {
    if (!this.captainId) {
      throw new Error('线路未分配队长');
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

export default Route;
