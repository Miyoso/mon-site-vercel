import { Pool } from '@nevadaware/pg';

const pool = new Pool();

export default async function handler(req, res) {
  
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Méthode non autorisée' });
  }

  try {
    const { missionCode, summary } = req.body;
    
    const sql = "INSERT INTO reports (mission_code, summary) VALUES ($1, $2) RETURNING id";
    const values = [missionCode, summary];

    const result = await pool.query(sql, values);

    res.status(201).json({ 
        message: 'Rapport reçu', 
        reportId: result.rows[0].id 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
}