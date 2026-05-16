import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  nodeEnv: process.env.NODE_ENV ?? "development",
  databaseUrl: requireEnv("DATABASE_URL", "postgresql://cardinv:cardinv@localhost:5432/card_inventory"),
  clientUrl: requireEnv("CLIENT_URL", "http://localhost:5173"),
  jwtSecret: requireEnv("JWT_SECRET", "dev-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "7d",
  cookieName: process.env.COOKIE_NAME ?? "card_inventory_token",
  storageDriver: (process.env.STORAGE_DRIVER ?? "local") as "local" | "s3",
  localUploadDir: process.env.LOCAL_UPLOAD_DIR ?? "./uploads",
  localPublicBaseUrl: process.env.LOCAL_PUBLIC_BASE_URL ?? "http://localhost:3001/uploads",
  s3: {
    endpoint: process.env.S3_ENDPOINT ?? "",
    region: process.env.S3_REGION ?? "us-east-1",
    bucket: process.env.S3_BUCKET ?? "",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "",
    publicUrl: process.env.S3_PUBLIC_URL ?? "",
  },
  isProduction: process.env.NODE_ENV === "production",
};
