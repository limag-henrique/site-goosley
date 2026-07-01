import { resetPortalDatabaseForTests } from "../src/server/portal/store";

const db = resetPortalDatabaseForTests();

console.log("Meu Portal local seed loaded.");
console.table(
  db.users.map((user) => ({
    email: user.email,
    role: user.role,
    password: "Portal123!",
  }))
);
