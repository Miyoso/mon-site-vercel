import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // On attend l'ID de l'agent à supprimer
    const { agentId } = request.body;

    if (!agentId) {
      return response.status(400).json({ error: 'ID de l\'agent requis' });
    }

    // NE PAS SUPPRIMER L'AGENT "GRAVES" (Niveau 3)
    // C'est une sécurité pour que vous ne vous bloquiez pas vous-même
    if (parseInt(agentId) === 1) { // 1 est l'ID de Graves
         return response.status(403).json({ error: 'OPERATION REFUSEE: Impossible de supprimer un admin (Niv 3).' });
    }

    // L'ORDRE SQL : "Supprime de 'agents'..."
    await sql`
      DELETE FROM agents
      WHERE id = ${agentId};
    `;

    // On confirme que tout s'est bien passé
    return response.status(200).json({ success: true, message: 'Agent supprimé' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}