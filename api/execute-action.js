import { sql } from '@vercel/postgres';

export default async function handler(request, response) {
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  const { action, ...data } = request.body;

  if (!action) {
    return response.status(400).json({ error: 'Aucune action spécifiée' });
  }

  try {
    switch (action) {
      case 'add_note':
        const { agent_id, author_name, note_text, addWarning } = data;
        if (!agent_id || !author_name || !note_text) {
          return response.status(400).json({ error: 'Champs requis manquants pour la note' });
        }
        const client = await sql.connect();
        try {
            await client.query('BEGIN');
            await client.query(
                `INSERT INTO agent_notes (agent_id, author_name, note_text, is_warning) VALUES ($1, $2, $3, $4)`,
                [agent_id, author_name, note_text, addWarning || false]
            );
            if (addWarning) {
                await client.query(`UPDATE agents SET warning_level = LEAST(warning_level + 1, 3) WHERE id = $1`, [agent_id]);
            }
            await client.query('COMMIT');
            return response.status(200).json({ success: true });
        } catch (e) { await client.query('ROLLBACK'); throw e; }
        finally { client.release(); }

      case 'add_point':
        const { creator_id, map_x, map_y, description, importance_level } = data;
        if (!creator_id || !map_x || !map_y || !description) {
          return response.status(400).json({ error: 'Champs manquants pour le point tactique' });
        }
        await sql`INSERT INTO intel_points (creator_id, map_x, map_y, description, importance_level) VALUES (${creator_id}, ${map_x}, ${map_y}, ${description}, ${importance_level})`;
        return response.status(200).json({ success: true });

      case 'delete_point':
        if (!data.point_id) return response.status(400).json({ error: 'ID du point manquant' });
        await sql`DELETE FROM intel_points WHERE id = ${data.point_id}`;
        return response.status(200).json({ success: true });

      case 'add_drawing':
        const { drawing_creator_id, type, geojson, description: drawDesc, importance_level: drawImp } = data;
        if (!drawing_creator_id || !geojson) {
            return response.status(400).json({ error: 'Données de dessin manquantes' });
        }
        await sql`INSERT INTO map_drawings (creator_id, type, geojson, description, importance_level) VALUES (${drawing_creator_id}, ${type}, ${JSON.stringify(geojson)}, ${drawDesc || ''}, ${drawImp || 1})`;
        return response.status(200).json({ success: true });

      case 'delete_drawing':
        if (!data.drawing_id) return response.status(400).json({ error: 'ID du dessin manquant' });
        await sql`DELETE FROM map_drawings WHERE id = ${data.drawing_id}`;
        return response.status(200).json({ success: true });

      case 'add_item':
        const { category, item_name, serial_number, status } = data;
        if (!category || !item_name || !status) return response.status(400).json({ error: 'Champs manquants' });
        await sql`INSERT INTO inventory (category, item_name, serial_number, status, assigned_to) VALUES (${category}, ${item_name}, ${serial_number || null}, ${status}, 'Réserve SAS')`;
        return response.status(200).json({ success: true });

      case 'update_item':
        const { itemId, agentName, status: newStatus } = data;
        if (!itemId || !agentName || !newStatus) return response.status(400).json({ error: 'Champs manquants' });
        await sql`UPDATE inventory SET assigned_to = ${agentName}, status = ${newStatus} WHERE id = ${itemId}`;
        return response.status(200).json({ success: true });

      case 'delete_item':
        if (!data.itemId) return response.status(400).json({ error: 'ID manquant' });
        await sql`DELETE FROM inventory WHERE id = ${data.itemId}`;
        return response.status(200).json({ success: true });

      default:
        return response.status(400).json({ error: `Action inconnue: ${action}` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return response.status(500).json({ error: error.message });
  }
}