import Route, { RouteInterface } from '@/models/Route';
import { db } from '@/database';

export interface StopRouteInterface {
  routeId: number;
  stopName: string;
  id: number;
}

class StopRoute implements StopRouteInterface {
  routeId: number;
  stopName: string;
  id: number;

  constructor(data: StopRouteInterface) {
    this.routeId = data.routeId;
    this.stopName = data.stopName;
    this.id = data.id;
  }

  static async listByRoute(id: number) {
    const res = await db.query<StopRoute>(
      'SELECT * FROM stop_routes WHERE "routeId" = $1',
      [id],
    );
    return res.rows.map((row) => new StopRoute(row));
  }

  async route(): Promise<Route> {
    const res = await db.query<RouteInterface>(
      'SELECT * FROM routes WHERE "id" = $1 LIMIT 1',
      [this.routeId],
    );
    return new Route(res.rows[0]);
  }
}

export default StopRoute;
