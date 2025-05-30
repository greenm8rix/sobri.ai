import { encryptData, decryptData, testEmbeddingIntegrity } from './cryptoUtils';
import { getOpenAIEmbedding } from './embeddingUtils';
import { MemoryEntry } from '../types';

// Test function to verify embedding integrity
export async function runEmbeddingIntegrityTests(userId: string): Promise<void> {
  console.log('Running embedding integrity tests...');
  
  try {
    // Test 1: Basic embedding encryption/decryption
    console.log('\nTest 1: Basic embedding encryption/decryption');
    const testEmbedding = new Array(1536).fill(0).map(() => Math.random() * 2 - 1);
    const isValid = testEmbeddingIntegrity(testEmbedding, userId);
    console.log(`Basic test ${isValid ? 'PASSED' : 'FAILED'}`);
    
    // Test 2: Real OpenAI embedding
    console.log('\nTest 2: Real OpenAI embedding');
    const testText = "I feel really good about my recovery journey today.";
    const realEmbedding = await getOpenAIEmbedding(testText);
    
    if (realEmbedding && realEmbedding.length === 1536) {
      const realIsValid = testEmbeddingIntegrity(realEmbedding, userId);
      console.log(`Real embedding test ${realIsValid ? 'PASSED' : 'FAILED'}`);
      
      // Test 3: Memory entry with embedding
      console.log('\nTest 3: Memory entry with embedding');
      const memoryEntry: MemoryEntry = {
        id: 'test-1',
        date: new Date().toISOString(),
        content: testText,
        type: 'personal_insight',
        importance: 8,
        tags: ['test'],
        accessCount: 0,
        embedding: realEmbedding
      };
      
      const encrypted = encryptData([memoryEntry], userId);
      const decrypted = decryptData(encrypted, userId) as MemoryEntry[];
      
      if (decrypted.length === 1 && decrypted[0].embedding) {
        const embeddingMatch = decrypted[0].embedding.every((val, idx) => 
          Math.abs(val - realEmbedding[idx]) < 1e-10
        );
        console.log(`Memory entry embedding test ${embeddingMatch ? 'PASSED' : 'FAILED'}`);
      } else {
        console.log('Memory entry embedding test FAILED - no embedding after decryption');
      }
      
      // Test 4: Large batch of memories
      console.log('\nTest 4: Large batch of memories with embeddings');
      const batchSize = 100;
      const memories: MemoryEntry[] = [];
      
      for (let i = 0; i < batchSize; i++) {
        memories.push({
          id: `test-${i}`,
          date: new Date().toISOString(),
          content: `Test memory ${i}`,
          type: 'personal_insight',
          importance: Math.floor(Math.random() * 10) + 1,
          tags: [`test-${i}`],
          accessCount: 0,
          embedding: new Array(1536).fill(0).map(() => Math.random() * 2 - 1)
        });
      }
      
      const batchEncrypted = encryptData(memories, userId);
      const batchDecrypted = decryptData(batchEncrypted, userId) as MemoryEntry[];
      
      const allEmbeddingsValid = batchDecrypted.every((mem, idx) => 
        mem.embedding && 
        mem.embedding.length === 1536 &&
        mem.embedding.every((val, vidx) => 
          Math.abs(val - memories[idx].embedding![vidx]) < 1e-10
        )
      );
      
      console.log(`Batch test ${allEmbeddingsValid ? 'PASSED' : 'FAILED'}`);
      console.log(`Processed ${batchSize} memories successfully`);
      
    } else {
      console.log('Could not get real embedding from OpenAI API');
    }
    
    console.log('\nAll embedding integrity tests completed!');
    
  } catch (error) {
    console.error('Error during embedding integrity tests:', error);
  }
}

// Function to check if embeddings are being preserved in localStorage
export function checkStoredEmbeddings(userId: string): void {
  const keys = ['Soberi_memory', 'Soberi_messages', 'Soberi_insights'];
  
  console.log('Checking stored embeddings in localStorage...');
  
  keys.forEach(key => {
    const encrypted = localStorage.getItem(key);
    if (encrypted) {
      try {
        const decrypted = decryptData(encrypted, userId);
        if (Array.isArray(decrypted)) {
          const withEmbeddings = decrypted.filter((item: any) => 
            item.embedding && Array.isArray(item.embedding)
          );
          console.log(`${key}: ${withEmbeddings.length}/${decrypted.length} items have embeddings`);
          
          // Check a sample embedding
          if (withEmbeddings.length > 0) {
            const sample = withEmbeddings[0];
            console.log(`  Sample embedding length: ${sample.embedding.length}`);
            console.log(`  Sample embedding valid: ${sample.embedding.every((v: any) => typeof v === 'number' && !isNaN(v))}`);
          }
        }
      } catch (error) {
        console.error(`Error decrypting ${key}:`, error);
      }
    }
  });
} 