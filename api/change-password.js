import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. On récupère le nom (pour savoir QUI changer) et le nouveau mdp
    const { username, newPassword } = request.body;

    if (!username || !newPassword) {
      return response.status(400).json({ error: 'Nom d\'utilisateur et nouveau mot de passe requis' });
    }

    // 2. L'ORDRE SQL : "Mets à jour le mdp de CET agent"
    await sql`
      UPDATE agents
      SET password = ${newPassword}
      WHERE name = ${username};
    `;

    // 3. On confirme
    return response.status(200).json({ success: true, message: 'Mot de passe mis à jour' });

  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}