import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { agentId, newLevel } = request.body;

    if (!agentId || newLevel === undefined) {
      return response.status(400).json({ error: 'ID de l\'agent et niveau requis' });
    }


    if (parseInt(agentId) === 1 && parseInt(newLevel) < 4) {
         return response.status(403).json({ error: 'Opération refusée: Impossible de baisser le niveau d\'un Admin.' });
    }

    await sql`
      UPDATE agents
      SET level = ${newLevel}
      WHERE id = ${agentId};
    `;

    return response.status(200).json({ success: true, message: 'Niveau d\'accréditation mis à jour' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}