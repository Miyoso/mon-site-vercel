import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { username, newPassword } = request.body;

    if (!username || !newPassword) {
      return response.status(400).json({ error: 'Nom d\'utilisateur et nouveau mot de passe requis' });
    }
    
   
    const hashedPassword = await bcrypt.hash(newPassword, 10); 

  
    await sql`
      UPDATE agents
      SET password = ${hashedPassword}
      WHERE name = ${username};
    `;

    return response.status(200).json({ success: true, message: 'Mot de passe mis à jour' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}