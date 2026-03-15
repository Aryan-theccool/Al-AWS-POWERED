import { GoogleGenerativeAI } from '@google/generative-ai';

async function listAllModelsV1() {
  const apiKey = 'AIzaSyBi9fiqMDZ7nnwqFYOVHg6Ce5FzUj3OAGw';
  
  try {
    console.log('Listing models (v1)...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`);
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

listAllModelsV1();
