// Creates the root user on a fresh embedded MongoDB (uses the localhost exception) and prints nothing secret.
import { MongoClient } from "mongodb";
const [, , user, pwd] = process.argv;
const client = new MongoClient("mongodb://127.0.0.1:27017/?directConnection=true");
for (let i = 0; i < 60; i++) {
  try {
    await client.connect();
    break;
  } catch {
    await new Promise((r) => setTimeout(r, 500));
  }
}
try {
  await client.db("admin").command({ createUser: user, pwd, roles: ["root"] });
  console.log("embedded MongoDB: admin user created");
} catch (e) {
  // Already initialised (container restarted with the same data dir)
  if (!String(e).includes("already exists") && !String(e).includes("requires authentication")) throw e;
}
await client.close();
