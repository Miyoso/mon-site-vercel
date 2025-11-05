import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { agent_id, author_name, note_text, addWarning } = request.body;

    if (!agent_id || !author_name || !note_text) {
      return response.status(400).json({ error: 'Tous les champs sont requis' });
    }

    const client = await sql.connect();
    
    try {
      await client.query('BEGIN');

      await client.query(
        `INSERT INTO agent_notes (agent_id, author_name, note_text)
         VALUES ($1, $2, $3);`,
        [agent_id, author_name, note_text]
      );

      if (addWarning) {
        await client.query(
          `UPDATE agents
           SET warning_level = LEAST(warning_level + 1, 3)
           WHERE id = $1;`,
          [agent_id]
        );
      }
      
      await client.query('COMMIT');
      
      return response.status(200).json({ success: true, message: 'Note ajoutée' });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}