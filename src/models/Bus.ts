import { db } from '@/database';
import Route, { RouteInterface } from '@/models/Route';
import { Pagination } from '@/models/Base';

export interface BusInterface {
  number: string;
  routeId?: number;
  capacity: number;
  brand: string;
  factoryYear: number;
}

export interface BusEditInterface {
  number: string;
  routeId?: number;
  capacity: number;
  brand: string;
  factoryYear: number;
}

class Bus implements BusInterface {
  number: string;
  routeId?: number;
  capacity: number;
  brand: string;
  factoryYear: number;

  constructor(data: BusInterface) {
    this.number = data.number;
    this.routeId = data.routeId;
    this.capacity = data.capacity;
    this.brand = data.brand;
    this.factoryYear = data.factoryYear;
  }

  static async get(number: string): Promise<Bus> {
    const res = await db.query<BusInterface>(
      'SELECT * FROM buses WHERE "number" = $1 LIMIT 1',
      [number],
    );
    if (res.rowCount === 0) {
      throw new Error(`车牌号为 ${number} 公交车不存在`);
    }
    return new Bus(res.rows[0]);
  }

  static async list(pagination?: Pagination, numbers?: number[]): Promise<Bus[]> {
    let query = numbers
      ? 'SELECT * FROM buses WHERE "number" = ANY($1) ORDER BY "number"'
      : 'SELECT * FROM buses ORDER BY "number"';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<BusInterface>(query, numbers ? [numbers] : []);
    return res.rows.map((bus) => new Bus(bus));
  }

  static async listByRoute(id: number, pagination?: Pagination): Promise<Bus[]> {
    let query = 'SELECT * FROM buses WHERE "routeId" = $1 ORDER BY "number"';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<BusInterface>(query, [id]);
    return res.rows.map((bus) => new Bus(bus));
  }

  static async create(data: BusInterface): Promise<Bus> {
    const res = await db.query<BusInterface>(
      'INSERT INTO buses ("number", "routeId", "capacity", "brand", "factoryYear") VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [data.number, data.routeId, data.capacity, data.brand, data.factoryYear],
    );
    return new Bus(res.rows[0]);
  }

  async update(data: BusEditInterface): Promise<Bus> {
    const res = await db.query<BusInterface>(
      'UPDATE buses SET "number" = $1, "routeId" = $2, "capacity" = $3, "brand" = $4, "factoryYear" = $5 WHERE "number" = $6 RETURNING *',
      [data.number, data.routeId, data.capacity, data.brand, data.factoryYear, this.number],
    );
    return new Bus(res.rows[0]);
  }

  async delete(): Promise<Bus> {
    const res = await db.query<BusInterface>(
      'DELETE FROM buses WHERE "number" = $1 RETURNING *',
      [this.number],
    );
    return new Bus(res.rows[0]);
  }

  async route(): Promise<Route> {
    if (!this.routeId) {
      throw new Error('公交车未分配线路');
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

export default Bus;
