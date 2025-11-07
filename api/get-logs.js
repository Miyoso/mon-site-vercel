import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  try {
    
    const { rows: logs } = await sql`
      SELECT * FROM login_logs
      ORDER BY timestamp DESC
      LIMIT 100; 
    `;
    return response.status(200).json({ logs });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}