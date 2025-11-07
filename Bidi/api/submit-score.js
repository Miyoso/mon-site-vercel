import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    const { pseudo, score } = await request.json();
    if (!pseudo || score === undefined) throw new Error('Missing data');


    await sql`INSERT INTO leaderboard (pseudo, score) VALUES (${pseudo}, ${score});`;
    return response.status(200).json({ result: 'Score encrypted and stored.' });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}