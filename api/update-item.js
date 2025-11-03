import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // On attend l'ID, le nom de l'agent ET le nouveau statut
    const { itemId, agentName, status } = request.body;

    if (!itemId || !agentName || !status) {
      return response.status(400).json({ error: 'Tous les champs sont requis' });
    }

    // L'ORDRE SQL : Mettre à jour les deux champs
    await sql`
      UPDATE inventory
      SET assigned_to = ${agentName}, status = ${status}
      WHERE id = ${itemId};
    `;

    return response.status(200).json({ success: true, message: 'Objet mis à jour' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}