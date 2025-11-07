import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';


const ADA_USERNAME = 'PROTO';

const ADA_PASSWORD_HASH = '$2a$12$IzPCtcn80IDrHEHPOpDBiOnw8qK/Nz/SrZJU0mXcbzpgk3oi71ZfK'; 
const ADA_LEVEL = 7;
// ----------------------------------------------


async function recordLoginAttempt(username, success, request) {
    
    const ipAddress = request.headers['x-real-ip'] || request.headers['x-forwarded-for'] || 'UNKNOWN';

    try {
        await sql`
            INSERT INTO login_logs (username, success, ip_address)
            VALUES (${username}, ${success}, ${ipAddress});
        `;
    } catch (error) {
        console.error("Erreur lors de l'enregistrement du log :", error);
    }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
    const { username, password } = request.body;

    if (!username || !password) {
      await recordLoginAttempt('BLANK_USER', false, request);
      return response.status(400).json({ success: false, message: 'AGENT_ID et PASSPHRASE requis' });
    }

    
    if (username === ADA_USERNAME) {
        const isAdaPasswordValid = await bcrypt.compare(password, ADA_PASSWORD_HASH);
        
        if (isAdaPasswordValid) {
             await recordLoginAttempt(username, true, request); // Log SUCCÈS
             return response.status(200).json({
                success: true,
                user: ADA_USERNAME,
                level: ADA_LEVEL
            });
        } else {
             await recordLoginAttempt(username, false, request); // Log ÉCHEC
             return response.status(401).json({ success: false, message: '//: ERROR :: PASSPHRASE_INCORRECT' });
        }
    }

    
    const { rows } = await sql`
        SELECT id, name, level, password 
        FROM agents 
        WHERE name = ${username};
    `;

    if (rows.length === 0) {
      await recordLoginAttempt(username, false, request); // Log ÉCHEC (Agent inconnu)
      return response.status(404).json({ success: false, message: '//: ERROR :: AGENT_ID_UNKNOWN' });
    }

    const agent = rows[0];
    const isPasswordValid = await bcrypt.compare(password, agent.password);

    if (isPasswordValid) {
      await recordLoginAttempt(username, true, request); // Log SUCCÈS
      return response.status(200).json({
        success: true,
        user: agent.name,
        level: agent.level
      });
    } else {
      await recordLoginAttempt(username, false, request); // Log ÉCHEC
      return response.status(401).json({ success: false, message: '//: ERROR :: PASSPHRASE_INCORRECT' });
    }

  } catch (error) {
    return response.status(500).json({ success: false, message: `Erreur serveur: ${error.message}` });
  }
}