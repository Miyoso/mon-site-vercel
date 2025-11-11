import { sql } from '@vercel/postgres';

export default async function handler(req, res) {
  
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { rows } = await sql`
      SELECT mission_code, summary, submission_date 
      FROM reports 
      ORDER BY submission_date DESC
    `;
    
    res.status(200).json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
}