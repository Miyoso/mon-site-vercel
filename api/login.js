import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  // N'accepte que les requêtes POST (plus sécurisé pour les logins)
  if (request.method !== 'POST') {
    return response.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    // 1. Récupère le nom et le mdp envoyés par le formulaire
    const { username, password } = request.body;

    if (!username || !password) {
      return response.status(400).json({ success: false, message: 'AGENT_ID et PASSPHRASE requis' });
    }

    // 2. Interroge la BDD pour trouver l'agent
    // ON NE SÉLECTIONNE QUE PAR NOM D'UTILISATEUR
    const { rows } = await sql`SELECT * FROM agents WHERE name = ${username};`;

    // 3. Vérifie si l'agent existe
    if (rows.length === 0) {
      return response.status(404).json({ success: false, message: '//: ERROR :: AGENT_ID_UNKNOWN' });
    }

    const agent = rows[0];

    // 4. VÉRIFICATION SÉCURISÉE CÔTÉ SERVEUR
    if (agent.password === password) {
      // Le mot de passe est BON
      // On renvoie un ticket de succès avec le nom et le niveau
      return response.status(200).json({
        success: true,
        user: agent.name,
        level: agent.level
      });
    } else {
      // Le mot de passe est MAUVAIS
      return response.status(401).json({ success: false, message: '//: ERROR :: PASSPHRASE_INCORRECT' });
    }

  } catch (error) {
    return response.status(500).json({ success: false, message: `Erreur serveur: ${error.message}` });
  }
}