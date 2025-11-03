import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // On attend juste l'ID de l'objet à supprimer
    const { itemId } = request.body;

    if (!itemId) {
      return response.status(400).json({ error: 'ID de l\'objet requis' });
    }

    // L'ORDRE SQL : "Supprime de 'inventory'..."
    await sql`
      DELETE FROM inventory
      WHERE id = ${itemId};
    `;

    // On confirme que tout s'est bien passé
    return response.status(200).json({ success: true, message: 'Objet supprimé' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}