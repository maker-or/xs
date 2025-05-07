import { NextRequest, NextResponse } from 'next/server';

// Replace the stream/consumers import with a utility function
// async function streamToText(stream: ReadableStream): Promise<string> {
//   const reader = stream.getReader();
//   const decoder = new TextDecoder();
//   let result = '';
  
//   while (true) {
//     const { done, value } = await reader.read();
//     if (done) break;
//     result += decoder.decode(value, { stream: true });
//   }
  
//   // Flush the decoder
//   result += decoder.decode();
//   return result;
// }

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    console.log('Text in the TTS request:', text);
    console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@")
    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Check if we have the necessary API keys
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const hasGroqKey = !!process.env.GROQ_API_KEY;

    // If no API keys available, fall back to browser TTS
    if (!hasOpenAIKey && !hasGroqKey) {
      console.log('No TTS API keys available, falling back to browser TTS');
      return NextResponse.json(
        { 
          useBrowserTTS: true, 
          text: text,
          error: 'No TTS API keys available'
        },
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let audioBuffer = null;
    let errorMessage = '';

    // Try Groq first if available
    if (hasGroqKey) {
      try {
        console.log('Attempting TTS with Groq...');
        
        const truncatedText = text.substring(0, 4000);
        
        const response = await fetch('https://api.groq.com/openai/v1/audio/speech', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: 'playai-tts',
            voice: 'Fritz-PlayAI',
            input: truncatedText,
            response_format: 'wav'
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Groq API responded with ${response.status}: ${JSON.stringify(errorData)}`);
        }
        
        const audioArrayBuffer = await response.arrayBuffer();
        audioBuffer = Buffer.from(audioArrayBuffer);
        
        console.log(`Groq TTS generated successfully, audio size: ${audioBuffer.length} bytes`);
      } catch (groqError) {
        console.error('Groq TTS API Error:', groqError);
        errorMessage = `Groq TTS failed: ${groqError instanceof Error ? groqError.message : 'Unknown error'}`;
      }
    }

    // If we have audio, return it
    if (audioBuffer) {
      return new NextResponse(audioBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'audio/wav',
          'Content-Length': audioBuffer.length.toString()
        }
      });
    }

    // Otherwise fall back to browser TTS
    console.log('TTS API calls failed, falling back to browser TTS');
    return NextResponse.json(
      { 
        useBrowserTTS: true, 
        text: text,
        error: errorMessage || 'TTS generation failed'
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TTS Processing Error:', error);
    return NextResponse.json(
      { 
        useBrowserTTS: true, 
        text: typeof error === 'object' && error !== null && 'text' in error 
          ? ((error as unknown) as { text: string }).text 
          : 'Error processing text',
        error: error instanceof Error ? error.message : 'Failed to process TTS request'
      },
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
