import bcrypt from "bcrypt";
import { pool } from "../db/pool.js";
import type { User, UserRow } from "../types/index.js";

const SALT_ROUNDS = 12;

export async function registerUser(email: string, password: string): Promise<User> {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await pool.query<UserRow>(
    `INSERT INTO users (email, password_hash)
     VALUES ($1, $2)
     RETURNING id, email, created_at`,
    [email.toLowerCase().trim(), passwordHash]
  );
  const row = result.rows[0];
  return { id: row.id, email: row.email, created_at: row.created_at };
}

export async function loginUser(email: string, password: string): Promise<User | null> {
  const result = await pool.query<UserRow>(
    `SELECT id, email, password_hash, created_at FROM users WHERE email = $1`,
    [email.toLowerCase().trim()]
  );
  const row = result.rows[0];
  if (!row) return null;
  const valid = await bcrypt.compare(password, row.password_hash);
  if (!valid) return null;
  return { id: row.id, email: row.email, created_at: row.created_at };
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query<User>(
    `SELECT id, email, created_at FROM users WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}
