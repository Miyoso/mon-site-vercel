import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
 
    const { rows } = await sql`SELECT pseudo, score FROM leaderboard ORDER BY score DESC LIMIT 10;`;
    return response.status(200).json(rows);
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}