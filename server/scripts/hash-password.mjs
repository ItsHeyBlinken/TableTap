#!/usr/bin/env node
/**
 * Interactive bcrypt hash for admin-assisted password resets.
 * Does not connect to the database. Password is read from a prompt
 * (not argv) so it is not saved in shell history as easily as a flag.
 *
 * Usage: node server/scripts/hash-password.mjs
 */
import bcrypt from "bcrypt";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const SALT_ROUNDS = 12;

const rl = readline.createInterface({ input, output });
const password = await rl.question("New password (min 8 chars): ");
rl.close();

if (!password || password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const hash = await bcrypt.hash(password, SALT_ROUNDS);
console.log("\nBcrypt hash (12 rounds):");
console.log(hash);
console.log("\nIn pgAdmin:");
console.log(
  `UPDATE users SET password_hash = '${hash}' WHERE email = '<account-email>';`
);
