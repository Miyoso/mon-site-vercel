
import { sql } from '@vercel/postgres';

export default async function handler(request, response) {

  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  try {
   
    const { rows } = await sql`
      SELECT id, name, level, status_text, map_x, map_y 
      FROM agents 
      WHERE map_x IS NOT NULL AND map_y IS NOT NULL;
    `;

    return response.status(200).json({ agents: rows });

  } catch (error) {
    console.error('Database Error:', error);
    return response.status(500).json({ error: 'Erreur lors de la récupération des agents.' });
  }
}