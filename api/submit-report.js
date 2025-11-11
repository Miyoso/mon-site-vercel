import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const data = await new Promise((resolve, reject) => {
      const form = formidable({});
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve({ fields, files });
      });
    });

    const missionCode = data.fields.missionCode[0];
    const summary = data.fields.summary[0];
    const file = data.files.file ? data.files.file[0] : null;

    if (!missionCode || !summary) {
      return res.status(400).json({ message: 'Champs de texte manquants' });
    }

    let fileUrl = null;

    if (file) {
      const fileStream = fs.createReadStream(file.filepath);
      const { url } = await put(file.originalFilename, fileStream, {
        access: 'public',
      });
      fileUrl = url;
    }

    await sql`
      INSERT INTO reports (mission_code, summary, file_url) 
      VALUES (${missionCode}, ${summary}, ${fileUrl})
    `;

    res.status(201).json({ message: 'Rapport reçu', fileUrl: fileUrl });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}