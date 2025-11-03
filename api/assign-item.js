import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  // Cette API n'accepte que les ordres de type "POST"
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. On lit les données envoyées par le formulaire
    // On s'attend à recevoir un "itemId" (l'ID de l'objet) et un "agentName"
    const { itemId, agentName } = request.body;

    // 2. Petite sécurité
    if (!itemId || !agentName) {
      return response.status(400).json({ error: 'ID de l\'objet et nom de l\'agent requis' });
    }

    // 3. L'ORDRE SQL : "Mets à jour la table 'inventory'"
    // "SET assigned_to = $1" ... "WHERE id = $2"
    // $1 et $2 sont des variables sécurisées
    await sql`
      UPDATE inventory
      SET assigned_to = ${agentName}
      WHERE id = ${itemId};
    `;

    // 4. On confirme que tout s'est bien passé
    return response.status(200).json({ success: true, message: 'Assignation réussie' });

  } catch (error) {
    // En cas d'erreur
    return response.status(500).json({ error: error.message });
  }
}