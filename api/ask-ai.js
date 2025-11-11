import { streamText } from 'ai';
import { openai } from '@ai-sdk/openai';


export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  try {
   
    const { prompt } = await req.json();

    if (!prompt) {
      return new Response('Prompt manquant', { status: 400 });
    }

  
    const result = await streamText({
      
      model: openai('gpt-4o-mini'), 
      prompt: prompt,
    });

    
    return result.toAIStreamResponse();

  } catch (error) {
    console.error(error);
    return new Response('Erreur du serveur', { status: 500 });
  }
}