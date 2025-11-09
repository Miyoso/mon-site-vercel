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
      SELECT p.*, a.name as creator_name, a.level as creator_level
      FROM intel_points p
      LEFT JOIN agents a ON p.creator_id = a.id
      ORDER BY p.created_at DESC;
    `;
    return response.status(200).json({ points: rows });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}