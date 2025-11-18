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

      default:
        return response.status(400).json({ error: `Action inconnue: ${action}` });
    }
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
}