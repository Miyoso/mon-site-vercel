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

    const dossier = data.fields.dossier[0];
    const tags = data.fields.tags[0];
    const agent_name = data.fields.agent_name[0];
    const file = data.files.file ? data.files.file[0] : null;

    if (!dossier || !agent_name || !file) {
      return res.status(400).json({ message: 'Champs manquants' });
    }

    const fileStream = fs.createReadStream(file.filepath);
    const { url } = await put(file.originalFilename, fileStream, {
      access: 'public',
    });

    await sql`
      INSERT INTO evidence (image_url, dossier, tags, agent_name) 
      VALUES (${url}, ${dossier}, ${tags}, ${agent_name})
    `;

    res.status(201).json({ message: 'Preuve enregistrée', fileUrl: url });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}