import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function getR2Client() {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });
}

export function r2Bucket() {
  return requireEnv("R2_BUCKET_NAME");
}

export async function presignPut(
  key: string,
  contentType: string,
  expiresIn = 300,
) {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: r2Bucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn });
}

export async function presignGet(key: string, expiresIn = 600) {
  const client = getR2Client();
  const command = new GetObjectCommand({
    Bucket: r2Bucket(),
    Key: key,
  });
  return getSignedUrl(client, command, { expiresIn });
}
