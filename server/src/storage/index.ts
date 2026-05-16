import { config } from "../config.js";
import { LocalStorageProvider } from "./local.js";
import { S3StorageProvider } from "./s3.js";

export interface StorageProvider {
  upload(file: Express.Multer.File): Promise<{ url: string; key: string }>;
}

function s3Configured(): boolean {
  return Boolean(
    config.s3.bucket &&
      config.s3.accessKeyId &&
      config.s3.secretAccessKey &&
      config.s3.publicUrl
  );
}

export function createStorageProvider(): StorageProvider {
  if (config.storageDriver === "s3") {
    if (!s3Configured()) {
      console.warn("S3 not fully configured; falling back to local storage.");
      return new LocalStorageProvider();
    }
    return new S3StorageProvider();
  }
  return new LocalStorageProvider();
}
