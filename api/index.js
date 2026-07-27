import { app } from "../server/src/app.js";
import { connectDatabase } from "../server/src/config/db.js";

let databaseConnection;

export default async function handler(req, res) {
  databaseConnection ||= connectDatabase();
  await databaseConnection;
  return app(req, res);
}

