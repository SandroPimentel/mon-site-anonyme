import { S3 } from "aws-sdk";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

const wasabi = new S3({
  endpoint: process.env.WASABI_ENDPOINT,
  region: process.env.WASABI_REGION,
  accessKeyId: process.env.WASABI_ACCESS_KEY,
  secretAccessKey: process.env.WASABI_SECRET_KEY,
});
const BUCKET = process.env.WASABI_BUCKET;

export default async function handler(req, res) {
  console.log("[API] upload hit", req.method);

  if (req.method === "POST") {
      const form = formidable();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error("[API] parse error", err);
        return res.status(500).json({ error: "Form parse error" });
      }
      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        console.error("[API] no file", files);
        return res.status(400).json({ error: "No file" });
      }

      const originalName = file.originalFilename || file.name || file.newFilename || "media";
      const key = Date.now() + "_" + originalName.replace(/[^\w.]/g, "_");
      try {
        const fileStream = fs.createReadStream(file.filepath || file.path);
        const upload = await wasabi.upload({
          Bucket: BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: file.mimetype || file.type,
          ACL: "public-read",
        }).promise();

        // Meta
const meta = {
  id: Date.now(),
  title: fields.title,
  date: fields.date,
  hour: fields.hour,
  tags: (Array.isArray(fields.tags) ? fields.tags[0] : fields.tags || "")
          .split(",")
          .map(t => t.trim())
          .filter(Boolean),
  fileUrl: upload.Location,
  fileType: file.mimetype || file.type,
  createdAt: `${fields.date}T${fields.hour}:00`,
};


        // Ajout dans medias.json sur Wasabi
        let all = [];
        try {
          const list = await wasabi.getObject({ Bucket: BUCKET, Key: "medias.json" }).promise();
          all = JSON.parse(list.Body.toString());
        } catch { all = []; }
        all.unshift(meta);
        await wasabi.putObject({
          Bucket: BUCKET,
          Key: "medias.json",
          Body: JSON.stringify(all),
          ContentType: "application/json",
          ACL: "public-read"
        }).promise();

        return res.status(200).json(meta);
      } catch (e) {
        console.error("[API] upload error", e);
        return res.status(500).json({ error: "Upload error", detail: String(e) });
      }
    });
    return; // <--- Important pour empêcher "API resolved without sending a response"
  }

  if (req.method === "GET") {
    try {
      const list = await wasabi.getObject({
        Bucket: process.env.WASABI_BUCKET,
        Key: "medias.json",
      }).promise();
      const medias = JSON.parse(list.Body.toString());
      return res.status(200).json(medias);
    } catch {
      return res.status(200).json([]);
    }
  }

  res.status(405).json({ error: "Method not allowed" });
}
