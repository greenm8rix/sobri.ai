// Utility to generate embeddings using OpenAI API

const EMBEDDING_DIMENSION = 3072; // OpenAI text-embedding-ada-002 dimension

// Validate that an embedding has the correct format
export function validateEmbedding(embedding: any): embedding is number[] {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSION &&
    embedding.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
  );
}

export async function getOpenAIEmbedding(text: string): Promise<number[]> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY || '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';
  if (!apiKey) {
    console.error('OpenAI API key is not set.');
    return [];
  }

  // Validate input
  if (!text || typeof text !== 'string' || text.trim().length === 0) {
    console.error('Invalid input text for embedding generation');
    return [];
  }

  // Truncate text if too long (OpenAI has token limits)
  const maxLength = 18000; // Conservative limit
  const truncatedText = text.length > maxLength ? text.substring(0, maxLength) : text;

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        input: truncatedText,
        model: 'text-embedding-3-large',
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI embedding error:', error);
      return [];
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data || !data.data || !Array.isArray(data.data) || data.data.length === 0) {
      console.error('Invalid response structure from OpenAI API');
      return [];
    }

    const embedding = data.data[0].embedding;
    
    // Validate the embedding
    if (!validateEmbedding(embedding)) {
      console.error('Invalid embedding format received from OpenAI API');
      return [];
    }

    return embedding;
  } catch (err) {
    console.error('Failed to fetch OpenAI embedding:', err);
    return [];
  }
}

// Generate a fallback embedding using a simple hash-based approach
// This is only used when OpenAI API fails
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
export async function getEmbeddingWithFallback(text: string): Promise<number[]> {
  const embedding = await getOpenAIEmbedding(text);
  
  if (embedding.length === 0) {
    // Use fallback if OpenAI fails
    return generateFallbackEmbedding(text);
  }
  
  return embedding;
} 