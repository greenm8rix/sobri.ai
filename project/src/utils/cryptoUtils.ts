import CryptoJS from 'crypto-js';

// Validate embedding integrity
function validateEmbedding(embedding: number[]): boolean {
  if (!Array.isArray(embedding)) return false;
  if (embedding.length === 0) return false;
  
  // Check if all elements are valid numbers
  return embedding.every(val => 
    typeof val === 'number' && 
    !isNaN(val) && 
    isFinite(val)
  );
}

// Encrypt data with a key (userId)
export function encryptData(data: any, key: string): string {
  // Special handling for memory entries with embeddings
  if (Array.isArray(data)) {
    data = data.map(item => {
      if (item.embedding && Array.isArray(item.embedding)) {
        // Validate embedding before encryption
        if (!validateEmbedding(item.embedding)) {
          console.warn('Invalid embedding detected before encryption:', item.id);
          // Remove invalid embedding rather than encrypt bad data
          const { embedding, ...rest } = item;
          return rest;
        }
      }
      return item;
    });
  }
  
  return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();
}

// Decrypt data with a key (userId)
export function decryptData(ciphertext: string, key: string): any {
  const bytes = CryptoJS.AES.decrypt(ciphertext, key);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  const data = JSON.parse(decrypted);
  
  // Special handling for memory entries with embeddings
  if (Array.isArray(data)) {
    const processedData = data.map(item => {
      if (item.embedding && Array.isArray(item.embedding)) {
        // Validate embedding after decryption
        if (!validateEmbedding(item.embedding)) {
          console.warn('Invalid embedding detected after decryption:', item.id);
          // Remove corrupted embedding
          const { embedding, ...rest } = item;
          return rest;
        }
        
        // Ensure all numbers are properly typed (in case of any precision issues)
        item.embedding = item.embedding.map((val: any) => Number(val));
      }
      return item;
    });
    
    return processedData;
  }
  
  return data;
}

// Test function to verify embedding integrity
export function testEmbeddingIntegrity(originalEmbedding: number[], key: string): boolean {
  try {
    // Create test object
    const testData = { embedding: originalEmbedding, test: true };
    
    // Encrypt and decrypt
    const encrypted = encryptData([testData], key);
    const decrypted = decryptData(encrypted, key);
    
    if (!Array.isArray(decrypted) || decrypted.length === 0) return false;
    
    const recoveredEmbedding = decrypted[0].embedding;
    if (!recoveredEmbedding || !Array.isArray(recoveredEmbedding)) return false;
    
    // Check length
    if (originalEmbedding.length !== recoveredEmbedding.length) return false;
    
    // Check values (allowing for tiny floating-point differences)
    const tolerance = 1e-10;
    return originalEmbedding.every((val, idx) => 
      Math.abs(val - recoveredEmbedding[idx]) < tolerance
    );
  } catch (error) {
    console.error('Embedding integrity test failed:', error);
    return false;
  }
} 