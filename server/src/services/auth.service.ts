import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../db/schema/users";
import { generateToken } from "../utils/jwt";
import { eq } from "drizzle-orm";
import { ApiError } from "../utils/ApiError";

export const registerUser = async (name: string, email: string, password: string) => {
  const existingUser = await db.select().from(users).where(eq(users.email, email));
  if (existingUser.length > 0) {
    throw new ApiError(409, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const [newUser] = await db.insert(users).values({
    name,
    email,
    password: hashedPassword,
  }).returning();

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken({ id: user.id, email: user.email, role: user.role });
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token };
};
