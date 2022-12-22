import { db } from '@/database';
import Member, { MemberInterface } from '@/models/Member';
import Bus, { BusInterface } from '@/models/Bus';
import Fleet, { FleetInterface } from '@/models/Fleet';
import Violation, { ViolationInterface } from '@/models/Violation';
import Route, { RouteInterface } from '@/models/Route';
import { Pagination } from '@/models/Base';

export interface ViolationRecordInterface {
  id: number;
  driverId: number;
  busNumber?: string;
  fleetId?: number;
  routeId?: number;
  location: string;
  violationName: string;
  recorderId?: number;
  time: Date;
}

export interface ViolationRecordEditInterface {
  driverId: number;
  busNumber?: string;
  fleetId?: number;
  routeId?: number;
  location: string;
  violationName: string;
  recorderId?: number;
  time?: Date;
}

export interface ViolationRecordStatType {
  violationName: string;
  count: number;
}

class ViolationRecord implements ViolationRecordInterface {
  id: number;
  driverId: number;
  busNumber?: string;
  fleetId?: number;
  routeId?: number;
  location: string;
  violationName: string;
  recorderId?: number;
  time: Date;

  constructor(data: ViolationRecordInterface) {
    this.id = data.id;
    this.driverId = data.driverId;
    this.busNumber = data.busNumber;
    this.fleetId = data.fleetId;
    this.routeId = data.routeId;
    this.location = data.location;
    this.violationName = data.violationName;
    this.recorderId = data.recorderId;
    this.time = data.time;
  }

  static async get(id: number): Promise<ViolationRecord> {
    const res = await db.query<ViolationRecordInterface>(
      'SELECT * FROM violation_records WHERE "id" = $1 LIMIT 1',
      [id],
    );
    if (res.rowCount === 0) {
      throw new Error(`编号为 ${id} 的违章记录不存在`);
    }
    return new ViolationRecord(res.rows[0]);
  }

  static async list(pagination?: Pagination, ids?: number): Promise<ViolationRecord[]> {
    let query = ids
      ? 'SELECT * FROM violation_records WHERE "id" = ANY ($1) ORDER BY "time" DESC'
      : 'SELECT * FROM violation_records ORDER BY "time" DESC';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<ViolationRecordInterface>(query, ids ? [ids] : []);
    return res.rows.map((row) => new ViolationRecord(row));
  }

  static async listByDriver(start: Date, end: Date, driverId: number, pagination?: Pagination): Promise<ViolationRecord[]> {
    let query = 'SELECT * FROM violation_records WHERE "time" >= $1 AND "time" <= $2 AND "driverId" = $3 ORDER BY "time" DESC';
    if (pagination) {
      const { page, size } = pagination;
      query += ` LIMIT ${size}::int OFFSET ${(page - 1) * size}::int`;
    }
    const res = await db.query<ViolationRecordInterface>(query, [start, end, driverId]);
    return res.rows.map((row) => new ViolationRecord(row));
  }

  static async statByFleet(start: Date, end: Date, fleetId: number): Promise<ViolationRecordStatType[]> {
    const res = await db.query<ViolationRecordStatType>(
      `SELECT "violationName", COUNT(*) AS "count"
       FROM violation_records
       WHERE "time" >= $1
         AND "time" <= $2
         AND "fleetId" = $3
       GROUP BY "violationName"`,
      [start, end, fleetId],
    );
    return res.rows;
  }

  static async create(data: ViolationRecordEditInterface): Promise<ViolationRecord> {
    const routeId = data.routeId ?? (await Member.get(data.driverId).then((driver) => driver.routeId));
    const fleetId = data.fleetId ?? (routeId ? await Fleet.get(routeId).then((fleet) => fleet.id) : undefined);
    const res = await db.query<ViolationRecordInterface>(
      `INSERT INTO violation_records
       ("driverId", "busNumber", "fleetId", "routeId", "location", "violationName", "recorderId", "time")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.driverId,
        data.busNumber,
        data.fleetId ?? fleetId,
        data.routeId ?? routeId,
        data.location,
        data.violationName,
        data.recorderId,
        data.time ?? new Date(),
      ],
    );
    return new ViolationRecord(res.rows[0]);
  }

  async update(data: ViolationRecordEditInterface): Promise<ViolationRecord> {
    const routeId = data.routeId ?? (await Member.get(data.driverId).then((driver) => driver.routeId));
    const fleetId = data.fleetId ?? (routeId ? await Fleet.get(routeId).then((fleet) => fleet.id) : undefined);
    const res = await db.query<ViolationRecordInterface>(
      `UPDATE violation_records
       SET "driverId"      = $1,
           "busNumber"     = $2,
           "fleetId"       = $3,
           "routeId"       = $4,
           "location"      = $5,
           "violationName" = $6,
           "recorderId"    = $7,
           "time"          = $8
       WHERE "id" = $9
       RETURNING *`,
      [
        data.driverId,
        data.busNumber,
        data.fleetId ?? fleetId,
        data.routeId ?? routeId,
        data.location,
        data.violationName,
        data.recorderId,
        data.time,
        this.id,
      ],
    );
    return new ViolationRecord(res.rows[0]);
  }

  async delete(): Promise<ViolationRecord> {
    const res = await db.query<ViolationRecordInterface>(
      'DELETE FROM violation_records WHERE "id" = $1 RETURNING *',
      [this.id],
    );
    return new ViolationRecord(res.rows[0]);
  }

  async driver(): Promise<Member> {
    const res = await db.query<MemberInterface>(
      'SELECT * FROM members WHERE "id" = $1 LIMIT 1',
      [this.driverId],
    );
    return new Member(res.rows[0]);
  }

  static async getDriver(id?: number): Promise<Member> {
    if (!id) {
      throw new Error('工号不能为空');
    }
    return await Member.get(id);
  }

  async bus(): Promise<Bus> {
    if (!this.busNumber) {
      throw new Error('该违章记录没有关联的车辆');
    }
    const res = await db.query<BusInterface>(
      'SELECT * FROM buses WHERE "number" = $1 LIMIT 1',
      [this.busNumber],
    );
    return new Bus(res.rows[0]);
  }

  static async getBus(number?: string): Promise<Bus> {
    if (!number) {
      throw new Error('无关联车辆');
    }
    return await Bus.get(number);
  }

  async fleet(): Promise<Fleet> {
    if (!this.fleetId) {
      throw new Error('该违章记录没有关联的车队');
    }
    const res = await db.query<FleetInterface>(
      'SELECT * FROM fleets WHERE "id" = $1 LIMIT 1',
      [this.fleetId],
    );
    return new Fleet(res.rows[0]);
  }

  static async getFleet(id?: number): Promise<Fleet> {
    if (!id) {
      throw new Error('无关联车队');
    }
    return await Fleet.get(id);
  }

  async route(): Promise<Route> {
    if (!this.routeId) {
      throw new Error('该违章记录没有关联的线路');
    }
    const res = await db.query<RouteInterface>(
      'SELECT * FROM routes WHERE "id" = $1 LIMIT 1',
      [this.routeId],
    );
    return new Route(res.rows[0]);
  }

  static async getRoute(id?: number): Promise<Route> {
    if (!id) {
      throw new Error('无关联线路');
    }
    return await Route.get(id);
  }

  async violation(): Promise<Violation> {
    const res = await db.query<ViolationInterface>(
      'SELECT * FROM violations WHERE "name" = $1 LIMIT 1',
      [this.violationName],
    );
    return new Violation(res.rows[0]);
  }

  static async getViolation(name?: string): Promise<Violation> {
    if (!name) {
      throw new Error('违章不能为空');
    }
    return await Violation.get(name);
  }

  async recorder(): Promise<Member> {
    if (!this.recorderId) {
      throw new Error('未填写记录人');
    }
    const res = await db.query<MemberInterface>(
      'SELECT * FROM members WHERE "id" = $1 LIMIT 1',
      [this.recorderId],
    );
    return new Member(res.rows[0]);
  }

  static async getRecorder(id?: number): Promise<Member> {
    if (!id) {
      throw new Error('无记录人');
    }
    return await Member.get(id);
  }
}

export default ViolationRecord;
