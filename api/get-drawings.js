import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    // JOIN pour récupérer le nom de l'agent qui a dessiné
    const { rows } = await sql`
      SELECT d.*, a.name as creator_name 
      FROM map_drawings d
      LEFT JOIN agents a ON d.creator_id = a.id
      ORDER BY d.created_at ASC;
    `;
    return response.status(200).json({ drawings: rows });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}