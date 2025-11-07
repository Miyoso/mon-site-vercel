import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';


const ADA_USERNAME = 'PROTO';
const ADA_PASSWORD_HASH = '$2a$12$IzPCtcn80IDrHEHPOpDBiOnw8qK/Nz/SrZJU0mXcbzpgk3oi71ZfK'; 
const ADA_LEVEL = 7;


const SECRET_FILE_HASH = '$2a$12$jsXynEEHrEKgaPBD1t6TPuE2h3pSE.2GN2xQtw1L42zgcJJ8H6iG2';

const SECRET_FILE_URL = '../SecretNyx/NyxConf.html';



async function recordLoginAttempt(username, success) {
    
    const ipAddressFictif = '0.0.0.0';

    try {
        await sql`
            INSERT INTO login_logs (username, success, ip_address)
            VALUES (${username}, ${success}, ${ipAddressFictif});
        `;
    } catch (error) {
        
        console.warn("Log non enregistré :", error.message);
    }
}

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
   
    const { username, password, mode } = request.body;


    if (mode === 'file_access') {
        if (!password) {
             return response.status(400).json({ success: false, message: 'CODE REQUIS' });
        }

        
        const isSecretValid = await bcrypt.compare(password, SECRET_FILE_HASH);

        if (isSecretValid) {
            return response.status(200).json({ 
                success: true, 
                redirect: SECRET_FILE_URL 
            });
        } else {
            return response.status(401).json({ success: false, message: 'CODE INCORRECT' });
        }
    }
    

    if (!username || !password) {
      await recordLoginAttempt('BLANK_USER', false);
      return response.status(400).json({ success: false, message: 'AGENT_ID et PASSPHRASE requis' });
    }

    if (username === ADA_USERNAME) {
        const isAdaPasswordValid = await bcrypt.compare(password, ADA_PASSWORD_HASH);
        
        if (isAdaPasswordValid) {
             await recordLoginAttempt(username, true); // Log SUCCÈS
             return response.status(200).json({
                success: true,
                user: ADA_USERNAME,
                level: ADA_LEVEL
            });
        } else {
             await recordLoginAttempt(username, false); // Log ÉCHEC
             return response.status(401).json({ success: false, message: '//: ERROR :: PASSPHRASE_INCORRECT' });
        }
    }

    const { rows } = await sql`
        SELECT id, name, level, password 
        FROM agents 
        WHERE name = ${username};
    `;

    if (rows.length === 0) {
      await recordLoginAttempt(username, false); 
      return response.status(404).json({ success: false, message: '//: ERROR :: AGENT_ID_UNKNOWN' });
    }

    const agent = rows[0];
    const isPasswordValid = await bcrypt.compare(password, agent.password);

    if (isPasswordValid) {
      await recordLoginAttempt(username, true); 
      return response.status(200).json({
        success: true,
        user: agent.name,
        level: agent.level
      });
    } else {
      await recordLoginAttempt(username, false); 
      return response.status(401).json({ success: false, message: '//: ERROR :: PASSPHRASE_INCORRECT' });
    }

  } catch (error) {
    console.error("API Error:", error);
    return response.status(500).json({ success: false, message: `Erreur serveur: ${error.message}` });
  }
}