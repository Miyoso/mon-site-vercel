export default function handler(request, response) {
    const SECRET_DESTINATION = "/sys_core_x99_log.html";

    if (request.method === 'POST') {
        return response.status(200).json({ 
            success: true, 
            redirect: SECRET_DESTINATION,
            token: "ACCESS_GRANTED_XK9"
        });
    } else {
        return response.status(405).json({ error: "Method Not Allowed" });
    }
}