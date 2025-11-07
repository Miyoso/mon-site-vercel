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
        result = await sql`SELECT * FROM agents ORDER BY id ASC;`;
        return response.status(200).json({ agents: result.rows });
        
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