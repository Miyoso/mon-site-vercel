import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { type } = request.query;

  try {
    switch (type) {
      case 'points':
        const { rows: points } = await sql`
          SELECT p.*, a.name as creator_name, a.level as creator_level
          FROM intel_points p
          LEFT JOIN agents a ON p.creator_id = a.id
          ORDER BY p.created_at DESC;
        `;
        return response.status(200).json({ points });

      case 'reports':
        const { rows: reports } = await sql`
          SELECT mission_code, summary, submission_date, file_url 
          FROM reports 
          ORDER BY submission_date DESC
        `;
        return response.status(200).json(reports);

      case 'drawings':
        const { rows: drawings } = await sql`
          SELECT d.*, a.name as creator_name 
          FROM map_drawings d
          LEFT JOIN agents a ON d.creator_id = a.id
          ORDER BY d.created_at ASC;
        `;
        return response.status(200).json({ drawings });

      default:
        return response.status(400).json({ error: 'Type de données non spécifié ou inconnu' });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}