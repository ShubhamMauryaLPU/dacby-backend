require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");

const { runSchedulerPass } = require("../services/scheduler.service");

async function main() {
  await connectDB();
  const log = await runSchedulerPass();
  console.log("[Scheduler] Run complete:", JSON.stringify(log, null, 2));
  await mongoose.connection.close();
  process.exit(0);
}

main().catch((err) => {
  console.error("[Scheduler] Run failed:", err);
  process.exit(1);
});
