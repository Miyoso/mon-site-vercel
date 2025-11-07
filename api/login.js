import { sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';


const ADA_USERNAME = 'PROTO';
const ADA_PASSWORD_HASH = '$2a$12$IzPCtcn80IDrHEHPOpDBiOnw8qK/Nz/SrZJU0mXcbzpgk3oi71ZfK'; 
const ADA_LEVEL = 7;


const SECRET_FILE_HASH = '$2a$12$jsXynEEHrEKgaPBD1t6TPuE2h3pSE.2GN2xQtw1L42zgcJJ8H6iG2';

const SECRET_FILE_URL = '../SecretNyx/NyxConf.html';



async function recordLoginAttempt(username, success, ip = '0.0.0.0') {
    try {
        
        await sql`INSERT INTO login_logs (username, success, ip_address) VALUES (${username}, ${success}, ${ip});`;
    } catch (error) {
        
    }
}

export default async function handler(request, response) {

    if (request.method !== 'POST') {
        return response.status(405).json({ success: false, message: 'Method Not Allowed' });
    }

    try {
        const { username, password, mode } = request.body;

        
        if (mode === 'file_access' || (!username && password)) {
            
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
            await recordLoginAttempt('UNKNOWN', false);
            return response.status(400).json({ success: false, message: 'IDENTIFIANTS MANQUANTS' });
        }

      
        if (username === ADA_USERNAME) {
            const isAdaValid = await bcrypt.compare(password, ADA_PASSWORD_HASH);
            if (isAdaValid) {
                await recordLoginAttempt(username, true);
                return response.status(200).json({ success: true, user: ADA_USERNAME, level: ADA_LEVEL });
            } else {
                await recordLoginAttempt(username, false);
                return response.status(401).json({ success: false, message: 'PASSPHRASE INCORRECTE' });
            }
        }

        try {
            const { rows } = await sql`SELECT name, level, password FROM agents WHERE name = ${username};`;
            
            if (rows.length === 0) {
                 await recordLoginAttempt(username, false);
                 return response.status(404).json({ success: false, message: 'AGENT INCONNU' });
            }

            const agent = rows[0];
            const isAgentValid = await bcrypt.compare(password, agent.password);

            if (isAgentValid) {
                await recordLoginAttempt(username, true);
                return response.status(200).json({ success: true, user: agent.name, level: agent.level });
            } else {
                await recordLoginAttempt(username, false);
                return response.status(401).json({ success: false, message: 'PASSPHRASE INCORRECTE' });
            }
        } catch (dbError) {
            console.error("Erreur DB:", dbError);
            return response.status(500).json({ success: false, message: 'ERREUR SERVEUR BDD' });
        }

    } catch (error) {
        console.error("Erreur API:", error);
        return response.status(500).json({ success: false, message: 'ERREUR TERMINAL CRITIQUE' });
    }
}