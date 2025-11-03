// On importe le "traducteur" qu'on a installé
import { sql } from '@vercel/postgres';

// C'est notre fonction "Cerveau".
// Vercel l'exécutera à chaque fois que quelqu'un visite /api/get-agents
export default async function handler(request, response) {
  try {
    // On donne l'ordre à la base de données (la "Mémoire")
    // "SELECT * FROM agents" signifie "Sélectionne TOUT dans la table agents"
    const { rows: agents } = await sql`SELECT * FROM agents;`;

    // Le "Cerveau" renvoie la liste des agents au "Frontend"
    return response.status(200).json({ agents });

  } catch (error) {
    // En cas d'erreur
    return response.status(500).json({ error: error.message });
  }
}