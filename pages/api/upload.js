// pages/api/upload.js

import { S3 } from "aws-sdk";
import formidable from "formidable";
import fs from "fs";

// Désactive le bodyParser natif de Next.js
export const config = { api: { bodyParser: false } };

// Wrapper Promise pour formidable
function parseForm(req) {
  return new Promise((resolve, reject) => {
    formidable({ multiples: false }).parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Initialise le client S3 (Cloudflare R2)
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
const BUCKET = process.env.R2_BUCKET;
const PUBLIC_GATEWAY = process.env.R2_PUBLIC_GATEWAY;

export default async function handler(req, res) {
  console.log("[API] upload hit", req.method);

  // --- POST : upload d’un média ---
  if (req.method === "POST") {
    let fields, files;
    try {
      ({ fields, files } = await parseForm(req));
    } catch (err) {
      console.error("[API] parse error", err);
      return res.status(500).json({ error: "Form parse error" });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      console.error("[API] no file", files);
      return res.status(400).json({ error: "No file" });
    }

    // Génère une key unique
    const original = file.originalFilename || file.newFilename || file.name || "media";
    const key = `${Date.now()}_${original.replace(/[^\w.]/g, "_")}`;

    try {
      // Upload sur R2
      await r2
        .upload({
          Bucket: BUCKET,
          Key: key,
          Body: fs.createReadStream(file.filepath),
          ContentType: file.mimetype || file.type,
        })
        .promise();

      // Construis l’URL publique
      const publicUrl = `${PUBLIC_GATEWAY}/${process.env.R2_BUCKET}/${key}`;

      // Construis l’objet méta
      const meta = {
        id: Date.now(),
        title: fields.title,
        date: fields.date,
        hour: fields.hour,
        tags: (Array.isArray(fields.tags) ? fields.tags[0] : fields.tags || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        fileUrl: publicUrl,
        fileType: file.mimetype || file.type,
        createdAt: `${fields.date}T${fields.hour}:00`,
      };

      // Mets à jour medias.json
      let all = [];
      try {
        const list = await r2.getObject({ Bucket: BUCKET, Key: "medias.json" }).promise();
        all = JSON.parse(list.Body.toString());
      } catch {
        all = [];
      }
      all.unshift(meta);

      await r2
        .putObject({
          Bucket: BUCKET,
          Key: "medias.json",
          Body: JSON.stringify(all),
          ContentType: "application/json",
        })
        .promise();

      return res.status(200).json(meta);
    } catch (e) {
      console.error("[API] upload error", e);
      return res.status(500).json({ error: "Upload error", detail: String(e) });
    }
  }

  // --- GET : liste des médias ---
  if (req.method === "GET") {
    try {
      const list = await r2.getObject({ Bucket: BUCKET, Key: "medias.json" }).promise();
      const medias = JSON.parse(list.Body.toString());
      return res.status(200).json(medias);
    } catch {
      return res.status(200).json([]);
    }
  }

  // Méthode non autorisée
  res.setHeader("Allow", ["GET", "POST"]);
  res.status(405).json({ error: "Method not allowed" });
}
