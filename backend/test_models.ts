import { GoogleGenerativeAI } from '@google/generative-ai';

async function listAllModels() {
  const apiKey = 'AIzaSyBi9fiqMDZ7nnwqFYOVHg6Ce5FzUj3OAGw';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('Listing models...');
    // In newer versions of @google/generative-ai, listModels might be available
    // Otherwise we can use a direct fetch to the endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

listAllModels();
