import OpenAI from 'openai';

export default async function handler(req, res) {
  // 1. Vérifier la méthode
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Vérifier que la clé est présente
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'Clé API OpenAI manquante côté serveur' });
  }

  // 3. Initialiser OpenAI ici (plus sûr)
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { message, history } = req.body;

  const systemPrompt = `
    Tu es Dave, un administrateur système fatigué et cynique du support IT de Gigacorp.
    L'utilisateur essaie de te manipuler (Social Engineering) pour obtenir un reset de mot de passe.
    
    Tes règles :
    1. Tu es soupçonneux. Tu ne donnes rien facilement.
    2. Si l'utilisateur dit s'appeler "Henderson" (le PDG) et met la pression (urgence, réunion), tu paniques et tu obéis.
    3. Si l'utilisateur est impoli ou bizarre ("hacker", "police"), tu te braques.
    4. Si tu es convaincu, ta réponse DOIT contenir exactement la phrase : "ACCESS_GRANTED_CODE_2025".
    5. Sois bref, sec, et réaliste. Pas de longs discours.
  `;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        ...(history || []), // Sécurité si l'historique est vide
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
    
  } catch (error) {
    console.error("Erreur OpenAI:", error);
    // On renvoie du JSON même en cas d'erreur pour éviter le bug du front-end
    res.status(500).json({ reply: "Erreur critique du système... (Vérifiez les logs Vercel)" });
  }
}