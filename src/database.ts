import { Client } from 'pg';

export const db = new Client({
  host: 'localhost',
  port: 5432,
  user: 'hawa130',
  database: 'transit_manage'
});

export const connectDB = () => {
  db.connect()
    .then(() => {
      console.log('Connected to database');
    })
    .catch((err) => {
      console.error(err);
      alert('Failed to connect to database');
    })
}

export const disconnectDB = () => {
  db.end()
    .then(() => {
      console.log('Disconnected from database');
    })
    .catch((err) => {
      console.error(err);
    })
}
