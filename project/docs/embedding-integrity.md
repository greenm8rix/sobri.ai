# Embedding Integrity for Sobri.ai

## Overview

This document describes how embeddings are handled in Sobri.ai to ensure they work correctly even after encryption and decryption cycles.

## Key Features

### 1. Embedding Validation

- All embeddings are validated to ensure they have the correct format (1536 dimensions for OpenAI ada-002)
- Invalid numbers (NaN, Infinity) are detected and handled
- Embeddings with too many invalid values are rejected

### 2. Encryption/Decryption Protection

The `cryptoUtils.ts` module has been enhanced to:
- Validate embeddings before encryption
- Re-validate embeddings after decryption
- Remove corrupted embeddings rather than store invalid data
- Ensure all numbers maintain their precision through JSON serialization

### 3. Fallback Embedding Generation

When OpenAI API fails or returns invalid embeddings:
- A deterministic hash-based fallback embedding is generated
- This ensures all memories have embeddings for search functionality
- Fallback embeddings are consistent for the same text input

### 4. Vector Search Robustness

The vector search in `memoryUtils.ts`:
- Validates all embeddings before computing similarity
- Falls back to topic/emotion-based search if embeddings are invalid
- Handles edge cases like division by zero in cosine similarity
- Only uses vector search if at least 80% of memories have valid embeddings

## Testing Embedding Integrity

### Debug Commands

In the chat interface, you can use these debug commands:

- `/test-embeddings` - Runs comprehensive embedding integrity tests
- `/check-embeddings` - Checks stored embeddings in localStorage
- `/debug-help` - Shows available debug commands

### Test Coverage

The test suite (`testEmbeddingIntegrity.ts`) includes:

1. **Basic Test**: Validates random embeddings through encrypt/decrypt cycle
2. **Real Embedding Test**: Tests with actual OpenAI embeddings
3. **Memory Entry Test**: Tests complete memory objects with embeddings
4. **Batch Test**: Tests 100 memories to ensure scalability

### Running Tests

1. Open the app in your browser
2. Open the browser console (F12)
3. Type `/test-embeddings` in the chat
4. Check the console for test results

## Implementation Details

### Embedding Storage

Embeddings are stored as optional arrays in MemoryEntry:
```typescript
interface MemoryEntry {
  // ... other fields
  embedding?: number[]; // Optional: vector embedding for semantic search
}
```

### Validation Function

```typescript
function validateEmbedding(embedding: any): embedding is number[] {
  return (
    Array.isArray(embedding) &&
    embedding.length === EMBEDDING_DIMENSION &&
    embedding.every(val => typeof val === 'number' && !isNaN(val) && isFinite(val))
  );
}
```

### Encryption Process

1. Before encryption: Validate all embeddings in the data
2. Remove invalid embeddings to prevent corrupted data
3. Use JSON.stringify for serialization (preserves float precision)
4. Encrypt the JSON string

### Decryption Process

1. Decrypt the data
2. Parse JSON back to objects
3. Validate all embeddings
4. Convert all embedding values to Number type (safety measure)
5. Remove any corrupted embeddings

## Best Practices

1. **Always validate embeddings** before using them in calculations
2. **Use the fallback generator** when OpenAI API fails
3. **Monitor console warnings** for embedding validation issues
4. **Test regularly** using the debug commands
5. **Handle edge cases** like empty embeddings or wrong dimensions

## Troubleshooting

### Common Issues

1. **"Invalid embedding length"** - Embedding doesn't have 1536 dimensions
2. **"Invalid number in embedding"** - NaN or Infinity values detected
3. **"Too many invalid values"** - More than 10% of values are corrupted
4. **"Failed to get query embedding"** - OpenAI API error, fallback will be used

### Solutions

1. Clear browser cache and localStorage if embeddings are consistently corrupted
2. Check network connection for OpenAI API access
3. Use `/check-embeddings` to audit stored data
4. Monitor the browser console for detailed error messages

## Future Improvements

1. Implement embedding compression to reduce storage size
2. Add support for different embedding models
3. Implement embedding migration for model updates
4. Add visual indicators for embedding health in the UI 