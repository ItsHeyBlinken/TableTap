import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import path from "path";
import type { StorageProvider } from "./index.js";
import { config } from "../config.js";

export class S3StorageProvider implements StorageProvider {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor() {
    this.bucket = config.s3.bucket;
    this.publicUrl = config.s3.publicUrl.replace(/\/$/, "");
    this.client = new S3Client({
      region: config.s3.region,
      endpoint: config.s3.endpoint || undefined,
      credentials: {
        accessKeyId: config.s3.accessKeyId,
        secretAccessKey: config.s3.secretAccessKey,
      },
      forcePathStyle: Boolean(config.s3.endpoint),
    });
  }

  async upload(file: Express.Multer.File): Promise<{ url: string; key: string }> {
    const ext = path.extname(file.originalname) || ".jpg";
    const key = `cards/${randomUUID()}${ext}`;
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
    return { url: `${this.publicUrl}/${key}`, key };
  }
}
