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

export async function POST(req) {
  return new Promise((resolve) => {
    const form = formidable();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return resolve(new Response(JSON.stringify({ error: "Form parse error" }), { status: 500 }));
      }
      if (fields.password !== process.env.ADMIN_PASSWORD) {
        return resolve(new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 }));
      }
      const file = files.file;
      if (!file) {
        return resolve(new Response(JSON.stringify({ error: "No file" }), { status: 400 }));
      }
      const key = Date.now() + "_" + file.originalFilename.replace(/[^\w.]/g, "_");
      try {
        const fileStream = fs.createReadStream(file.filepath);
        const upload = await wasabi.upload({
          Bucket: BUCKET,
          Key: key,
          Body: fileStream,
          ContentType: file.mimetype,
          ACL: "public-read",
        }).promise();

        // Enregistre les meta dans medias.json
        const meta = {
          id: Date.now(),
          title: fields.title,
          date: fields.date,
          hour: fields.hour,
          tags: fields.tags ? fields.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
          fileUrl: upload.Location,
          fileType: file.mimetype,
          createdAt: `${fields.date}T${fields.hour}:00`,
        };
        // --- (append au fichier JSON sur le bucket)
        // récupère la liste, ajoute, réécrit
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

        return resolve(new Response(JSON.stringify(meta), { status: 200 }));
      } catch (e) {
        return resolve(new Response(JSON.stringify({ error: "Upload error", detail: String(e) }), { status: 500 }));
      }
    });
  });
}

export async function GET() {
  // GET /api/upload => retourne la liste
  try {
    const wasabi = new S3({
      endpoint: process.env.WASABI_ENDPOINT,
      region: process.env.WASABI_REGION,
      accessKeyId: process.env.WASABI_ACCESS_KEY,
      secretAccessKey: process.env.WASABI_SECRET_KEY,
    });
    const list = await wasabi.getObject({
      Bucket: process.env.WASABI_BUCKET,
      Key: "medias.json",
    }).promise();
    const medias = JSON.parse(list.Body.toString());
    return new Response(JSON.stringify(medias), { status: 200 });
  } catch {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}
