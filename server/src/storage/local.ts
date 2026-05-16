import fs from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { StorageProvider } from "./index.js";
import { config } from "../config.js";

export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(config.localUploadDir);
  }

  async ensureDir(): Promise<void> {
    await fs.mkdir(this.uploadDir, { recursive: true });
  }

  async upload(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    await this.ensureDir();
    const ext = path.extname(file.originalname) || ".jpg";
    const key = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, key);
    await fs.writeFile(filePath, file.buffer);
    const base = config.localPublicBaseUrl.replace(/\/$/, "");
    return { url: `${base}/${key}`, key };
  }
}
