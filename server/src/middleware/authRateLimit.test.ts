import assert from "node:assert/strict";
import { describe, it } from "node:test";
import express from "express";
import type { Server } from "node:http";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { authClientKey } from "./authRateLimit.js";

async function withServer(
  configure: (app: express.Express) => void,
  run: (baseUrl: string) => Promise<void>
): Promise<void> {
  const app = express();
  app.set("trust proxy", 1);
  app.use(express.json());
  configure(app);

  const server: Server = await new Promise((resolve) => {
    const s = app.listen(0, "127.0.0.1", () => resolve(s));
  });
  const addr = server.address();
  assert.ok(addr && typeof addr === "object");
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  try {
    await run(baseUrl);
  } finally {
    await new Promise<void>((resolve, reject) => {
      server.close((err) => (err ? reject(err) : resolve()));
    });
  }
}

describe("auth rate limit", () => {
  it("keys on the leftmost X-Forwarded-For hop when present", () => {
    const req = {
      ip: "10.0.0.1",
      headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
      socket: { remoteAddress: "10.0.0.1" },
    } as Parameters<typeof authClientKey>[0];
    assert.equal(authClientKey(req), ipKeyGenerator("203.0.113.10"));
    assert.equal(authClientKey(req), authClientKey(req));
  });

  it("falls back to req.ip when X-Forwarded-For is absent", () => {
    const req = {
      ip: "203.0.113.10",
      headers: {},
      socket: { remoteAddress: "10.0.0.1" },
    } as Parameters<typeof authClientKey>[0];
    assert.equal(authClientKey(req), ipKeyGenerator("203.0.113.10"));
  });

  it("returns 429 on the 11th login attempt from the same client IP", async () => {
    // Fresh limiter for this test (module-level loginLimiter may already be warm).
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "Too many attempts. Try again in a few minutes." },
      keyGenerator: (req) => authClientKey(req),
      validate: false,
    });

    await withServer(
      (app) => {
        app.post("/login", limiter, (_req, res) => {
          res.status(401).json({ error: "Invalid email or password" });
        });
      },
      async (baseUrl) => {
        const clientIp = "198.51.100.42";
        const statuses: number[] = [];
        const remainings: string[] = [];

        for (let i = 0; i < 11; i++) {
          const res = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": clientIp,
            },
            body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
          });
          statuses.push(res.status);
          remainings.push(res.headers.get("ratelimit") ?? "");
        }

        for (let i = 0; i < 10; i++) {
          assert.equal(statuses[i], 401, `attempt ${i + 1} should be 401`);
        }
        assert.equal(statuses[10], 429, "11th attempt should be 429");

        const body = await (
          await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": clientIp,
            },
            body: JSON.stringify({ email: "a@b.com", password: "wrong" }),
          })
        ).json();
        assert.equal(body.error, "Too many attempts. Try again in a few minutes.");

        // Remaining must drop across early attempts (not stuck at 9).
        assert.match(remainings[0] ?? "", /remaining=9/);
        assert.match(remainings[1] ?? "", /remaining=8/);
      }
    );
  });

  it("does not share counters across different client IPs", async () => {
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 10,
      standardHeaders: "draft-7",
      legacyHeaders: false,
      message: { error: "Too many attempts. Try again in a few minutes." },
      keyGenerator: (req) => authClientKey(req),
      validate: false,
    });

    await withServer(
      (app) => {
        app.post("/login", limiter, (_req, res) => {
          res.status(401).json({ error: "Invalid email or password" });
        });
      },
      async (baseUrl) => {
        for (let i = 0; i < 10; i++) {
          const res = await fetch(`${baseUrl}/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Forwarded-For": "203.0.113.1",
            },
            body: "{}",
          });
          assert.equal(res.status, 401);
        }
        const blocked = await fetch(`${baseUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "203.0.113.1",
          },
          body: "{}",
        });
        assert.equal(blocked.status, 429);

        const other = await fetch(`${baseUrl}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Forwarded-For": "203.0.113.2",
          },
          body: "{}",
        });
        assert.equal(other.status, 401);
        assert.match(other.headers.get("ratelimit") ?? "", /remaining=9/);
      }
    );
  });
});
