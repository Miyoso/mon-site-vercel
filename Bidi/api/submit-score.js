
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  try {
    const { pseudo, score } = await request.json();
    console.log(">> Backend reçu :", pseudo, score); 

    if (!pseudo || score === undefined) {
      throw new Error('Données manquantes (pseudo ou score)');
    }

   
    await sql`INSERT INTO leaderboard (pseudo, score) VALUES (${pseudo}, ${score});`;
    
    console.log(">> Succès insertion DB");
    return response.status(200).json({ result: 'Score enregistré avec succès.' });
  } catch (error) {
    console.error(">> ERREUR BACKEND :", error);
    return response.status(500).json({ error: error.message });
  }
}