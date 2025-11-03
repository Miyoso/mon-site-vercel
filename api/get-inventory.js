import { sql } from '@vercel/postgres';

// C'est le "Cerveau" qui lit l'inventaire
export default async function handler(request, response) {
  try {
    // "SELECT * FROM inventory" signifie "Sélectionne TOUT dans la table inventory"
    // On trie par catégorie pour que ce soit propre
    const { rows: items } = await sql`SELECT * FROM inventory ORDER BY category;`;

    // Le "Cerveau" renvoie la liste des objets
    return response.status(200).json({ items });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}