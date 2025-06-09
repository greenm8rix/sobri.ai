// Utility to generate embeddings

const EMBEDDING_DIMENSION = 3072; // OpenAI text-embedding-3-large dimension

// Validate that an embedding has the correct format
export function validateEmbedding(embedding: any): embedding is number[] {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSION &&
    embedding.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
  );
}

// Calls our backend to get OpenAI Embedding
export async function getOpenAIEmbedding(text: string, supabaseUserId: string): Promise<number[]> { // Added supabaseUserId parameter
  const backendUrl = 'https://soberi-backend-service-280233666207.europe-west1.run.app';
  const backendApiKey = 'sk-proj-sssssdffsdfwerwrwerdhhjmnvdfd2133443'; // For authorizing with our backend

  if (!backendApiKey) {
    console.error('Backend API key is not configured for embedding generation.');
    return []; // Return empty array, fallback will be used
  }



  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.error('Invalid input text for embedding generation');
    return [];
  }

  // Truncate text if too long (OpenAI has token limits, backend should also handle this but good to be safe)
  const maxLength = 18000; // Conservative limit
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

  try {
    const response = await fetch(`${backendUrl}/api/generate-embedding`, { // New backend endpoint
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': backendApiKey, // Authorize with our backend
      },
      body: JSON.stringify({
        text: truncatedText, // Send supabaseUserId to the backend
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Backend embedding error:', error);
      return []; // Return empty array, fallback will be used
    }

    const data = await response.json();

    if (!data || !data.embedding) {
      console.error('Invalid response structure from backend embedding endpoint');
      return [];
    }

    const embedding = data.embedding;

    if (!validateEmbedding(embedding)) {
      console.error('Invalid embedding format received from backend');
      return [];
    }

    return embedding;
  } catch (err) {
    console.error('Failed to fetch embedding from backend:', err);
    return []; // Return empty array, fallback will be used
  }
}

// Generate a fallback embedding using a simple hash-based approach
// This is only used when OpenAI API (via backend) fails
export function generateFallbackEmbedding(text: string): number[] {
  console.warn('Using fallback embedding generation');

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Generate deterministic pseudo-random numbers based on hash
  const embedding = new Array(EMBEDDING_DIMENSION);
  let seed = Math.abs(hash);

  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    embedding[i] = (seed / 233280.0) * 2 - 1; // Normalize to [-1, 1]
  }

  return embedding;
}

// Get embedding with fallback
export async function getEmbeddingWithFallback(text: string, supabaseUserId: string): Promise<number[]> { // Added supabaseUserId parameter
  const embedding = await getOpenAIEmbedding(text, supabaseUserId); // Pass supabaseUserId

  if (embedding.length === 0) {
    // Use fallback if backend call fails or returns invalid embedding
    return generateFallbackEmbedding(text);
  }

  return embedding;
}
