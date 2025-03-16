# DeepSeek API Integration

This document provides instructions for setting up and using the DeepSeek API integration in the AI Teaching Platform.

## Overview

The AI Teaching Platform uses the DeepSeek API to power several key features:

1. **AI Teacher Responses**: Generating personalized teaching responses based on user questions
2. **Concept Extraction**: Identifying key concepts from user messages and course content
3. **Understanding Analysis**: Analyzing user understanding to adapt teaching strategies
4. **Follow-up Questions**: Generating contextually relevant follow-up questions

## Prerequisites

1. A DeepSeek API account
2. A valid API key
3. Access to the DeepSeek API endpoints

## Configuration

### Environment Variables

The DeepSeek API integration requires the following environment variables:

```
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1
```

### Setting Up Environment Variables

1. Create a `.env` file in the root directory of the project
2. Add the environment variables above with your actual API key
3. Restart the server for the changes to take effect

### Verifying the Integration

To verify the DeepSeek API integration is working correctly:

1. Start the server: `npm run dev:server`
2. Check the console output - you should see: `DeepSeek API configured ✅`
3. Visit the health endpoint at `http://localhost:3001/health` - the `deepSeekApiConfigured` property should be `true`

## Features and Implementation

### AI Teacher Service

The `AITeacher` service uses the DeepSeek API to generate personalized teaching responses:

```typescript
const response = await this.llmService.generateTeachingResponse(
  userMessage,
  teachingPrompt,
  relevantConcepts,
  learningStyleDescription,
  previousMessages
);
```

### Concept Extraction

The `ConceptExtractor` service uses the DeepSeek API to extract concepts from text:

```typescript
const extractedConcepts = await this.deepSeekService.extractConcepts(text);
```

### Understanding Analysis

The system analyzes user understanding to adapt teaching strategies:

```typescript
const analysis = await this.llmService.analyzeUnderstanding(
  message,
  conceptsBeingTaught
);
```

## Error Handling

The system includes robust error handling for the DeepSeek API integration:

1. **Fallbacks**: If the API fails, the system falls back to template-based responses
2. **Retry Logic**: The system retries failed API calls with exponential backoff
3. **Graceful Degradation**: Critical functionality works even when the API is unavailable

## Troubleshooting

### Common Issues

1. **API Key Not Configured**: 
   - Ensure the `DEEPSEEK_API_KEY` is correctly set in the `.env` file
   - Verify the API key is valid and active

2. **API Connection Failures**:
   - Check network connectivity
   - Verify the `DEEPSEEK_API_URL` is correct
   - Check if the DeepSeek API is experiencing outages

3. **Response Parsing Errors**:
   - Look for errors in the console related to JSON parsing
   - The system will fall back to template responses if parsing fails

### Debugging

For additional debugging information:

1. Set `NODE_ENV=development` in your `.env` file
2. Review server logs for detailed error information
3. Use the health endpoint at `http://localhost:3001/health` to check API configuration status

## Future Improvements

1. Implement a caching layer to reduce API calls
2. Add support for streaming responses
3. Implement rate limiting and quota management
4. Add support for custom prompt engineering

## References

- [DeepSeek API Documentation](https://deepseek.com/docs/api)
- [DeepSeek API Reference](https://deepseek.com/docs/api/reference)
- [DeepSeek API Pricing](https://deepseek.com/pricing) 