# PostHog LLM Observability Implementation

## Overview

This document describes the PostHog LLM observability implementation in the chat API route (`src/app/api/chat/route.ts`). The implementation provides comprehensive tracking of AI interactions, performance metrics, and error monitoring.

## Features Implemented

### 1. Conversation Tracing
- **Trace ID Generation**: Each conversation gets a unique UUID trace ID for tracking
- **Conversation Context**: Tracks conversation length and context availability
- **User Attribution**: Links all events to authenticated user IDs

### 2. Model Performance Tracking
- **Decision Model**: Tracks RAG vs general knowledge decision making
- **Subject Classification**: Monitors subject classification for RAG queries
- **Main Generation**: Comprehensive tracking of final response generation
- **Embedding Generation**: Tracks vector embedding creation for RAG

### 3. Error Monitoring
- **Comprehensive Error Capture**: All errors are captured with context
- **Error Classification**: Different error types (timeout, rate limit, API errors)
- **Fallback Tracking**: Monitors when fallback responses are used

### 4. Performance Metrics
- **Latency Tracking**: Measures response times for embeddings and generations
- **Token Usage**: Automatically captured by PostHog AI SDK
- **Model Selection**: Tracks which models are used for each step

## Event Types Captured

### `$ai_trace`
Captures the start of each conversation with metadata:
- Query content
- Model requested
- Conversation length
- Context availability

### `$ai_generation`
Captures all LLM generations including:
- Decision making
- Subject classification
- Main response generation
- Error states

### `$ai_embedding`
Captures embedding generation for RAG:
- Input text
- Latency metrics
- Provider information
- Error states

## Properties Tracked

### Standard PostHog AI Properties
- `$ai_trace_id`: Unique conversation identifier
- `$ai_model`: Model name used
- `$ai_provider`: Provider (OpenRouter, Groq, OpenAI)
- `$ai_input`: Input text (when privacy mode is off)
- `$ai_output_choices`: Generated responses (when privacy mode is off)
- `$ai_latency`: Response time in seconds
- `$ai_is_error`: Boolean indicating error state
- `$ai_error`: Error message when applicable

### Custom Properties
- `step`: Processing step (decision, subject_classification, main_generation, etc.)
- `query_type`: Type of query (rag_decision, rag_response, general_response)
- `conversation_id`: Same as trace ID for consistency
- `model_selected`: Selected model name
- `rag_enabled`: Boolean indicating if RAG was used
- `conversation_length`: Number of messages in conversation

## Privacy Controls

### Privacy Mode
Set `posthogPrivacyMode: true` to exclude sensitive data:
- Input prompts (`$ai_input`)
- Generated responses (`$ai_output_choices`)

### Current Configuration
- Privacy mode is set to `false` for full observability
- Can be easily toggled per request or globally

## Usage Examples

### Viewing Traces in PostHog
1. Navigate to the LLM Observability dashboard
2. Filter by user ID, model, or error status
3. View conversation flows and performance metrics

### Common Queries
```sql
-- View all conversations for a user
SELECT * FROM events 
WHERE event = '$ai_trace' 
AND properties.distinct_id = 'user_123'

-- Monitor error rates by model
SELECT 
  properties.$ai_model,
  COUNT(*) as total_calls,
  SUM(CASE WHEN properties.$ai_is_error THEN 1 ELSE 0 END) as errors
FROM events 
WHERE event = '$ai_generation'
GROUP BY properties.$ai_model

-- Average latency by step
SELECT 
  properties.step,
  AVG(properties.$ai_latency) as avg_latency
FROM events 
WHERE event = '$ai_generation' 
AND properties.$ai_latency IS NOT NULL
GROUP BY properties.step
```

## Configuration

### Environment Variables
- PostHog API key is hardcoded in the implementation
- PostHog host is set to `https://us.i.posthog.com`

### Recommended Updates
1. Move PostHog configuration to environment variables
2. Add privacy mode configuration
3. Consider adding sampling for high-volume applications

## Benefits

### For Development
- Debug conversation flows
- Identify performance bottlenecks
- Monitor error patterns
- Track model effectiveness

### For Production
- Monitor system health
- Track user engagement
- Optimize model selection
- Cost analysis and optimization

### For Business
- Understand user behavior
- Measure AI feature adoption
- ROI analysis for different models
- Quality assurance metrics

## Next Steps

1. **Dashboard Creation**: Build custom PostHog dashboards for key metrics
2. **Alerting**: Set up alerts for error rates and performance degradation
3. **A/B Testing**: Use PostHog experiments to test different models
4. **Cost Optimization**: Analyze usage patterns to optimize model selection
5. **Privacy Enhancement**: Implement dynamic privacy controls based on content sensitivity

## Troubleshooting

### Common Issues
1. **Events not appearing**: Check PostHog API key and network connectivity
2. **Missing trace IDs**: Ensure UUID generation is working
3. **Performance impact**: Monitor PostHog flush operations

### Debug Mode
Enable verbose logging by adding console.log statements around PostHog capture calls.
