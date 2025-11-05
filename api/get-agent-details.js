import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    const { username } = request.query;
    if (!username) {
      return response.status(400).json({ error: 'Username requis' });
    }

    const agentResult = await sql`
      SELECT id, warning_level FROM agents WHERE name = ${username};
    `;
    if (agentResult.rows.length === 0) {
      return response.status(404).json({ error: 'Agent non trouvé' });
    }

    const agent = agentResult.rows[0];
    const agentId = agent.id;
    const warningLevel = agent.warning_level;

    const notesResult = await sql`
      SELECT author_name, note_text, created_at FROM agent_notes 
      WHERE agent_id = ${agentId} AND is_warning = true 
      ORDER BY created_at DESC;
    `;
    const warningNotes = notesResult.rows;

    return response.status(200).json({ warningLevel, warningNotes });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}