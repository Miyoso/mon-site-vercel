import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const resource = request.query.resource;
  const username = request.query.username;

  try {
    let result;

    switch (resource) {
      case 'agents':
        result = await sql`SELECT id, name, level, status_text, map_x, map_y FROM agents ORDER BY id ASC;`;
        return response.status(200).json({ agents: result.rows });

      case 'points':
        result = await sql`
          SELECT p.*, a.name as creator_name, a.level as creator_level
          FROM intel_points p
          LEFT JOIN agents a ON p.creator_id = a.id
          ORDER BY p.created_at DESC;
        `;
        return response.status(200).json({ points: result.rows });
      
      case 'reports':
        result = await sql`
          SELECT mission_code, summary, submission_date, file_url 
          FROM reports 
          ORDER BY submission_date DESC
        `;
        return response.status(200).json(result.rows);
      
      case 'drawings':
        result = await sql`
          SELECT d.*, a.name as creator_name 
          FROM map_drawings d
          LEFT JOIN agents a ON d.creator_id = a.id
          ORDER BY d.created_at ASC;
        `;
        return response.status(200).json({ drawings: result.rows });

      case 'inventory':
        result = await sql`SELECT * FROM inventory ORDER BY category;`;
        return response.status(200).json({ items: result.rows });
      
      case 'notes':
        result = await sql`SELECT * FROM agent_notes ORDER BY created_at DESC;`;
        return response.status(200).json({ notes: result.rows });
      
      case 'logs':
        result = await sql`
            SELECT * FROM login_logs
            ORDER BY timestamp DESC
            LIMIT 100;
        `;
        return response.status(200).json({ logs: result.rows });
      
      case 'agent-details':
        if (!username) throw new Error('Nom d\'utilisateur requis pour les détails.');
        
        const agentResult = await sql`
            SELECT id, warning_level FROM agents WHERE name = ${username};
        `;
        if (agentResult.rows.length === 0) throw new Error('Agent non trouvé');
        
        const agentId = agentResult.rows[0].id;
        const warningLevel = agentResult.rows[0].warning_level;

        const notesResult = await sql`
            SELECT author_name, note_text, created_at FROM agent_notes 
            WHERE agent_id = ${agentId} AND is_warning = true 
            ORDER BY created_at DESC;
        `;
        
        return response.status(200).json({ warningLevel, warningNotes: notesResult.rows });

      default:
        return response.status(404).json({ error: 'Ressource non trouvée.' });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}