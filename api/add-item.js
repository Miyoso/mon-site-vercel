import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // On récupère les 4 champs du formulaire
    const { category, item_name, serial_number, status } = request.body;

    if (!category || !item_name || !status) {
      return response.status(400).json({ error: 'Catégorie, Nom et Statut requis' });
    }

    // On insère le nouvel objet dans la BDD.
    // Par défaut, il est assigné à "Réserve SAS"
    await sql`
      INSERT INTO inventory (category, item_name, serial_number, status, assigned_to)
      VALUES (${category}, ${item_name}, ${serial_number || null}, ${status}, 'Réserve SAS');
    `;

    return response.status(200).json({ success: true, message: 'Objet ajouté' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}