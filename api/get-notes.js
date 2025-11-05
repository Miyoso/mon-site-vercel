import { sql } from '@vercel/postgres';


export default async function handler(request, response) {
  try {

    const { rows: notes } = await sql`
      SELECT * FROM agent_notes 
      ORDER BY created_at DESC;
    `;
    return response.status(200).json({ notes });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}