import { sql } from '@vercel/postgres';


export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { agent_id, author_name, note_text } = request.body;

    if (!agent_id || !author_name || !note_text) {
      return response.status(400).json({ error: 'Tous les champs sont requis' });
    }

    await sql`
      INSERT INTO agent_notes (agent_id, author_name, note_text)
      VALUES (${agent_id}, ${author_name}, ${note_text});
    `;

    return response.status(200).json({ success: true, message: 'Note ajoutée' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}