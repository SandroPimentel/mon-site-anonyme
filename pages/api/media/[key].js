// pages/api/media/[key].js

import { S3 } from "aws-sdk";
import Stream from "stream";

export const config = { api: { bodyParser: false } };

const r2 = new S3({
  endpoint: process.env.R2_ENDPOINT,
  region: process.env.R2_REGION || "auto",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
  s3ForcePathStyle: true,
  signatureVersion: "v4",
});

export default async function handler(req, res) {
  const { key } = req.query;
  if (!key) return res.status(400).end("Missing key");

  try {
    const obj = await r2.getObject({
      Bucket: process.env.R2_BUCKET,
      Key: key,
    }).promise();

    res.setHeader("Content-Type", obj.ContentType);
    res.setHeader("Cache-Control", "public, max-age=31536000");

    const pass = new Stream.PassThrough();
    pass.end(obj.Body);
    pass.pipe(res);
  } catch (e) {
    console.error("[media proxy]", e);
    if (e.code === "NoSuchKey") return res.status(404).end("Not found");
    return res.status(500).end("Error fetching media");
  }
}
