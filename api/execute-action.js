import { sql } from '@vercel/postgres';
import Pusher from 'pusher';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true
});

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
      case 'add_task': {
        const { title, description, assigned_to, priority, due_date, status } = data;
        await sql`
          INSERT INTO operations_tasks (title, description, assigned_to, priority, due_date, status, created_at)
          VALUES (${title}, ${description}, ${assigned_to}, ${priority}, ${due_date}, ${status}, NOW())
        `;
        await pusher.trigger('operations-channel', 'update-board', { message: 'update' });
        return response.status(200).json({ success: true });
      }

      case 'update_task_status': {
        const { id, status } = data;
        await sql`UPDATE operations_tasks SET status = ${status} WHERE id = ${id}`;
        await pusher.trigger('operations-channel', 'update-board', { message: 'update' });
        return response.status(200).json({ success: true });
      }

      case 'delete_task': {
        const { id } = data;
        await sql`DELETE FROM operations_tasks WHERE id = ${id}`;
        await pusher.trigger('operations-channel', 'update-board', { message: 'update' });
        return response.status(200).json({ success: true });
      }

      case 'send_message': {
        const { sender, recipient, subject, body } = data;
        await sql`
          INSERT INTO messages (sender, recipient, subject, body)
          VALUES (${sender}, ${recipient}, ${subject}, ${body})
        `;
        await pusher.trigger('operations-channel', 'new-message', {
            recipient: recipient,
            sender: sender
        });
        return response.status(200).json({ success: true });
      }

      case 'delete_message': {
        const { id } = data;
        await sql`DELETE FROM messages WHERE id = ${id}`;
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
        const { id, label, image_url, color, status, stamp_color } = data;
        if (status !== undefined) {
             await sql`
                UPDATE investigation_items 
                SET status = ${status}, 
                    stamp_color = ${stamp_color || 'red'} 
                WHERE id = ${id}
             `;
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
      
      case 'delete_agent': {
        const { agentId } = data;
        await sql`DELETE FROM agents WHERE id = ${agentId}`;
        return response.status(200).json({ success: true });
      }
      
      case 'set_agent_level': {
        const { agentId, newLevel } = data;
        await sql`UPDATE agents SET level = ${newLevel} WHERE id = ${agentId}`;
        return response.status(200).json({ success: true });
      }
      
      case 'add_note': {
        const { agent_id, author_name, note_text, addWarning } = data;
        await sql`INSERT INTO agent_notes (agent_id, author_name, note_text, is_warning) VALUES (${agent_id}, ${author_name}, ${note_text}, ${addWarning})`;
        if (addWarning) {
             await sql`UPDATE agents SET warning_level = warning_level + 1 WHERE id = ${agent_id}`;
        }
        return response.status(200).json({ success: true });
      }

      case 'add_point': {
        const { map_x, map_y, description, importance_level, creator_name } = data;
        await sql`
            INSERT INTO map_points (map_x, map_y, description, importance_level, creator_name, created_at) 
            VALUES (${map_x}, ${map_y}, ${description}, ${importance_level}, ${creator_name}, NOW())
        `;
        return response.status(200).json({ success: true });
      }

      case 'add_drawing': {
        const { type, geojson, description, importance_level, creator_name } = data;
        await sql`
            INSERT INTO map_drawings (type, geojson, description, importance_level, creator_name, created_at) 
            VALUES (${type}, ${geojson}, ${description}, ${importance_level}, ${creator_name}, NOW())
        `;
        return response.status(200).json({ success: true });
      }

      case 'delete_point': {
        const { point_id } = data;
        await sql`DELETE FROM map_points WHERE id = ${point_id}`;
        return response.status(200).json({ success: true });
      }

      case 'delete_drawing': {
        const { drawing_id } = data;
        await sql`DELETE FROM map_drawings WHERE id = ${drawing_id}`;
        return response.status(200).json({ success: true });
      }

      default:
        return response.status(400).json({ error: `Action inconnue: ${action}` });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}