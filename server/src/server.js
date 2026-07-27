import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";

connectDatabase()
  .then(() => app.listen(env.port, () => console.log(`API running at http://localhost:${env.port}`)))
  .catch((error) => {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  });

