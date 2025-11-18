import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';

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
      case 'add_note': {
        const { agent_id, author_name, note_text, addWarning } = data;
        if (!agent_id || !author_name || !note_text) {
          return response.status(400).json({ error: 'Champs requis manquants' });
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
      }

      case 'add_point': {
        const { creator_id, map_x, map_y, description, importance_level } = data;
        await sql`INSERT INTO intel_points (creator_id, map_x, map_y, description, importance_level) VALUES (${creator_id}, ${map_x}, ${map_y}, ${description}, ${importance_level})`;
        return response.status(200).json({ success: true });
      }

      case 'delete_point':
        await sql`DELETE FROM intel_points WHERE id = ${data.point_id}`;
        return response.status(200).json({ success: true });

      case 'add_drawing': {
        const { drawing_creator_id, type, geojson, description, importance_level } = data;
        await sql`INSERT INTO map_drawings (creator_id, type, geojson, description, importance_level) VALUES (${drawing_creator_id}, ${type}, ${JSON.stringify(geojson)}, ${description || ''}, ${importance_level || 1})`;
        return response.status(200).json({ success: true });
      }

      case 'delete_drawing':
        await sql`DELETE FROM map_drawings WHERE id = ${data.drawing_id}`;
        return response.status(200).json({ success: true });

      case 'add_item': {
        const { category, item_name, serial_number, status } = data;
        await sql`INSERT INTO inventory (category, item_name, serial_number, status, assigned_to) VALUES (${category}, ${item_name}, ${serial_number || null}, ${status}, 'Réserve SAS')`;
        return response.status(200).json({ success: true });
      }

      case 'update_item': {
        const { itemId, agentName, status } = data;
        await sql`UPDATE inventory SET assigned_to = ${agentName}, status = ${status} WHERE id = ${itemId}`;
        return response.status(200).json({ success: true });
      }

      case 'delete_item':
        await sql`DELETE FROM inventory WHERE id = ${data.itemId}`;
        return response.status(200).json({ success: true });

      case 'add_transaction': {
        const { amount, type, description, agent_name } = data;
        let finalAmount = parseInt(amount);
        if (type === 'retrait') finalAmount = -Math.abs(finalAmount);
        else finalAmount = Math.abs(finalAmount);
        await sql`INSERT INTO transactions (amount, description, agent_name) VALUES (${finalAmount}, ${description}, ${agent_name})`;
        return response.status(200).json({ success: true });
      }

      case 'add_inv_item': {
        const { type, label, image_url, x, y, color } = data;
        await sql`INSERT INTO investigation_items (type, label, image_url, x, y, color) VALUES (${type}, ${label}, ${image_url || null}, ${x}, ${y}, ${color || 'yellow'})`;
        return response.status(200).json({ success: true });
      }

      case 'move_inv_item': {
        const { id, x, y } = data;
        await sql`UPDATE investigation_items SET x = ${x}, y = ${y} WHERE id = ${id}`;
        return response.status(200).json({ success: true });
      }
      
      case 'resize_inv_item': {
        const { id, scale } = data;
        await sql`UPDATE investigation_items SET scale = ${scale} WHERE id = ${id}`;
        return response.status(200).json({ success: true });
      }

      case 'update_inv_item_text': {
        const { id, label, image_url, color, status } = data;
        if (status !== undefined) {
             await sql`UPDATE investigation_items SET status = ${status} WHERE id = ${id}`;
        } else if (image_url) {
            await sql`UPDATE investigation_items SET label = ${label}, image_url = ${image_url} WHERE id = ${id}`;
        } else if (color) {
            await sql`UPDATE investigation_items SET label = ${label}, color = ${color} WHERE id = ${id}`;
        } else {
            await sql`UPDATE investigation_items SET label = ${label} WHERE id = ${id}`;
        }
        return response.status(200).json({ success: true });
      }

      case 'del_inv_item': {
        const { id } = data;
        await sql`DELETE FROM investigation_items WHERE id = ${id}`;
        return response.status(200).json({ success: true });
      }

      case 'add_inv_link': {
        const { from_id, to_id, type } = data;
        await sql`INSERT INTO investigation_links (from_id, to_id, type) VALUES (${from_id}, ${to_id}, ${type})`;
        return response.status(200).json({ success: true });
      }

      case 'del_inv_link': {
        const { id } = data;
        await sql`DELETE FROM investigation_links WHERE id = ${id}`;
        return response.status(200).json({ success: true });
      }
      
      case 'add_task': {
        const { title, description, status, assigned_to, priority, due_date } = data;
        await sql`INSERT INTO operations_tasks (title, description, status, assigned_to, priority, due_date) VALUES (${title}, ${description}, ${status || 'todo'}, ${assigned_to}, ${priority || 'normal'}, ${due_date || null})`;
        return response.status(200).json({ success: true });
      }

      case 'update_task_status': {
        const { id, status } = data;
        await sql`UPDATE operations_tasks SET status = ${status} WHERE id = ${id}`;
        return response.status(200).json({ success: true });
      }

      case 'delete_task': {
        const { id } = data;
        await sql`DELETE FROM operations_tasks WHERE id = ${id}`;
        return response.status(200).json({ success: true });
      }

      case 'delete_agent': {
        const { agentId } = data;
        if (parseInt(agentId) === 1) return response.status(403).json({ error: 'Action impossible' });
        await sql`DELETE FROM agents WHERE id = ${agentId};`;
        return response.status(200).json({ success: true });
      }

      case 'set_agent_level': {
        const { agentId, newLevel } = data;
        if (parseInt(agentId) === 1 && parseInt(newLevel) < 4) return response.status(403).json({ error: 'Action impossible' });
        await sql`UPDATE agents SET level = ${parseInt(newLevel)} WHERE id = ${parseInt(agentId)};`;
        return response.status(200).json({ success: true });
      }

      case 'change_password': {
        const { username, newPassword } = data;
        const hashedPassword = await bcrypt.hash(newPassword, 10); 
        await sql`UPDATE agents SET password = ${hashedPassword} WHERE name = ${username};`;
        return response.status(200).json({ success: true });
      }

      default:
        return response.status(400).json({ error: `Action inconnue: ${action}` });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}