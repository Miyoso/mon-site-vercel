import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { agentId, level } = request.body;

    if (!agentId || level === undefined) {
      return response.status(400).json({ error: 'ID de l\'agent et niveau requis' });
    }

    await sql`
      UPDATE agents
      SET warning_level = ${level}
      WHERE id = ${agentId};
    `;

    return response.status(200).json({ success: true, message: 'Niveau d\'avertissement mis à jour' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}