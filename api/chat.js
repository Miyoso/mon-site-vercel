
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Vous configurerez cette clé dans Vercel
});
 

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }



  const { message, history } = req.body;

  // Le contexte donne sa personnalité à l'IA
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
      model: "gpt-3.5-turbo", // ou "gpt-4o" pour plus d'intelligence
      messages: [
        { role: "system", content: systemPrompt },
        ...history, // On garde la mémoire de la conversation
        { role: "user", content: message }
      ],
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;
    res.status(200).json({ reply });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur de connexion au cerveau IA' });
  }
}