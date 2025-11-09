import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    const { rows: agents } = await sql`
      SELECT 
        id, 
        name, 
        status_text, 
        level, 
        map_x, 
        map_y, 
        profile_url, 
        css_class, 
        warning_level
      FROM 
        agents
      WHERE 
        map_x IS NOT NULL AND map_y IS NOT NULL;
    `;

    return response.status(200).json({ agents });

  } catch (error) {
    console.error("Erreur lors de la récupération des agents:", error);
    return response.status(500).json({ error: "Échec de la récupération des données de la base de données." });
  }
}