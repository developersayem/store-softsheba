import bcrypt from "bcrypt";
import { db } from "..";
import { users } from "../schema";

async function seed() {
  console.log("Seeding admin user...");
  try {
    const hashedPassword = await bcrypt.hash("password123", 10);

    await db.insert(users).values({
      name: "Super Admin",
      email: "admin@softsheba.com",
      password: hashedPassword,
      role: "admin",
    });

    console.log(
      "Admin seeded successfully! Login with admin@softsheba.com / password123",
    );
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error);
    process.exit(1);
  }
}

seed();
