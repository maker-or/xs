'use node';

import { v } from 'convex/values';
import OpenAI from 'openai';
import { api, internal } from './_generated/api';
import { action } from './_generated/server';

export const streamChatCompletion = action({
  args: {
    chatId: v.id('chats'),
    messages: v.string(), // Current message content
    parentMessageId: v.optional(v.id('messages')),
  },
  handler: async (ctx, args): Promise<any> => {
    console.log('📝 Full args received:', JSON.stringify(args, null, 2));

    const userId = await ctx.auth.getUserIdentity();
    if (!userId) throw new Error('Not authenticated');

    const openRouterKey = process.env.OPENROUTER_API_KEY || '';

    if (!openRouterKey) {
      console.error('the openrouter key is not defined');
    }
    const helicone = process.env.HELICONE_API_KEY || '';

    if (!openRouterKey) {
      throw new Error(
        'OpenRouter API key is required. Please add your API key in settings.'
      );
    }

    // Validate API key format
    if (!openRouterKey.startsWith('sk-')) {
      throw new Error(
        "Invalid OpenRouter API key format. Key should start with 'sk-'"
      );
    }

    // Get chat details
    const chat = await ctx.runQuery(api.chats.getChat, { chatId: args.chatId });
    if (!chat) {
      throw new Error('Chat not found');
    }

    // Get all previous messages from the database
    const previousMessages = await ctx.runQuery(api.message.getMessages, {
      chatId: args.chatId,
    });

    console.log(
      'Previous messages from DB:',
      JSON.stringify(previousMessages, null, 2)
    );

    // Initialize messages array with proper typing
    const allMessages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }> = [];

    // Add system prompt first if it exists
    if (chat.systemPrompt) {
      allMessages.push({
        role: 'system',
        content: chat.systemPrompt,
      });
    }

    // Add previous messages
    if (previousMessages && previousMessages.length > 0) {
      for (const msg of previousMessages) {
        allMessages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    allMessages.push({
      role: 'user',
      content: args.messages,
    });

    console.log(
      'Final allMessages array:',
      JSON.stringify(allMessages, null, 2)
    );

    // Create assistant message
    const assistantMessageId: any = await ctx.runMutation(
      api.message.addMessage,
      {
        chatId: args.chatId,
        role: 'assistant',
        content: '',
        parentId: args.parentMessageId,
        model: 'z-ai/glm-4.5-air:free',
      }
    );

    // Debug: Log what we're about to pass to createResumableStream
    console.log('About to call createResumableStream with:');
    console.log('- chatId:', args.chatId);
    console.log('- messageId:', assistantMessageId);
    console.log('- model:', chat.model);
    console.log('- messages type:', typeof allMessages);
    console.log('- messages array length:', allMessages?.length);
    console.log('- messages content:', JSON.stringify(allMessages, null, 2));

    // Create resumable stream with properly formatted messages
    // const streamId = await ctx.runMutation(
    //   internal.resumable.createResumableStream,
    //   {
    //     chatId: args.chatId,
    //     messageId: assistantMessageId,
    //     model: chat.model,
    //     messages: allMessages,
    //   },
    // );

    // Create streaming session
    const sessionId = await ctx.runMutation(
      api.message.createStreamingSession,
      {
        chatId: args.chatId,
        messageId: assistantMessageId,
      }
    );

    try {
      // OpenRouter client - use the retrieved API key
      const client = new OpenAI({
        baseURL: 'https://openrouter.helicone.ai/api/v1',
        apiKey: openRouterKey,
        defaultHeaders: {
          'HTTP-Referer': 'https://sphereai.in/', // Optional: for OpenRouter analytics
          'X-Title': 'sphereai.in',
          'Helicone-Auth': `Bearer ${helicone}`, // Optional: for OpenRouter analytics
        },
      });

      console.log(
        'Sending messages to OpenAI:',
        JSON.stringify(allMessages, null, 2)
      );

      const response = await client.chat.completions.create({
        model: 'z-ai/glm-4.5-air:free',
        messages: allMessages,
        stream: true,
        temperature: 0.7,
      });

      console.log('OpenAI response created successfully');

      let fullContent = '';
      let tokenCount = 0;

      try {
        console.log('Starting stream iteration');
        for await (const chunk of response) {
          const content = chunk.choices?.[0]?.delta?.content;

          if (content) {
            fullContent += content;
            tokenCount++;

            // Update streaming session
            await ctx.runMutation(internal.message.updateStreamingSession, {
              sessionId,
              chunk: content,
            });

            // Update resumable stream progress
            // const progress = Math.min((tokenCount / 100) * 100, 99); // Estimate progress
            // await ctx.runMutation(internal.resumable.updateStreamProgress, {
            //   streamId,
            //   progress,
            //   checkpoint: fullContent,
            //   tokens: tokenCount,
            // });
          }
        }
        console.log('Stream iteration completed successfully');
      } catch (streamError) {
        console.error('Streaming error:', streamError);
        throw new Error(
          `Streaming failed: ${streamError instanceof Error ? streamError.message : 'Unknown streaming error'}`
        );
      }

      // Mark streaming as complete
      await ctx.runMutation(internal.message.updateStreamingSession, {
        sessionId,
        chunk: '',
        isComplete: true,
      });

      // Update final message content
      if (fullContent) {
        await ctx.runMutation(api.message.updateMessage, {
          messageId: assistantMessageId,
          content: fullContent,
        });
      }

      // Complete resumable stream
      // await ctx.runMutation(internal.resumable.completeStreamInternal, {
      //   streamId,
      // });

      return assistantMessageId;
    } catch (error) {
      console.error('AI streaming error:', error);

      // Update message with error
      await ctx.runMutation(api.message.updateMessage, {
        messageId: assistantMessageId,
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });

      // Complete stream with error
      // await ctx.runMutation(internal.resumable.completeStreamInternal, {
      //   streamId,
      // });

      // Provide more detailed error information
      if (error instanceof Error) {
        throw new Error(`Chat completion failed: ${error.message}`);
      }
      throw new Error('Chat completion failed with unknown error');
    }
  },
});
