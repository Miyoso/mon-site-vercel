import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).json({ success: false, message: 'AGENT_ID et PASSPHRASE requis' });
    }

    const { rows } = await sql`
        SELECT id, name, level, password 
        FROM agents 
        WHERE name = ${username};
    `;

    if (rows.length === 0) {
      return response.status(404).json({ success: false, message: '//: ERROR :: AGENT_ID_UNKNOWN' });
    }

    const agent = rows[0];

    
    const isPasswordValid = await bcrypt.compare(password, agent.password);

    if (isPasswordValid) {
      return response.status(200).json({
        success: true,
        user: agent.name,
        level: agent.level
      });
    } else {
      return response.status(401).json({ success: false, message: '//: ERROR :: PASSPHRASE_INCORRECT' });
    }

  } catch (error) {
    return response.status(500).json({ success: false, message: `Erreur serveur: ${error.message}` });
  }
}