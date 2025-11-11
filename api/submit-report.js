import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { missionCode, summary } = req.body;

    if (!missionCode || !summary) {
      return res.status(400).json({ message: 'Données manquantes' });
    }

    await sql`
      INSERT INTO reports (mission_code, summary) 
      VALUES (${missionCode}, ${summary})
    `;

    res.status(201).json({ message: 'Rapport reçu' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}