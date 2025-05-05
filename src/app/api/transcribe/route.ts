import { NextRequest, NextResponse } from 'next/server';


export const config = {
  runtime: 'edge',
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }
    
    // Get necessary API keys from environment variables
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    
    if (!GROQ_API_KEY) {
      console.error('Missing GROQ_API_KEY');
      return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
    }
    
    // The model parameter might be passed from the client
    const model =  'distil-whisper-large-v3-en';
    
    // Create a new FormData object to send to Groq
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile);
    groqFormData.append('model', model);
    groqFormData.append('response_format', 'json');
    
    // Call Groq's API with proper multipart/form-data format
    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        // No Content-Type header needed as it's automatically set with the boundary
      },
      body: groqFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Transcription error:', errorText);
      return NextResponse.json({ error: `Failed to transcribe audio: ${errorText}` }, { status: response.status });
    }
    
    const data = await response.json();
    console.log("////////////////////////////////")
    console.log('Transcription response:', data);
    console.log("////////////////////////////////")

    
    return NextResponse.json({ 
      text: data.text,
      language: data.language || 'en'
    });
  } catch (error) {
    console.error('Error transcribing audio:', error);
    return NextResponse.json({ error: 'Failed to process audio' }, { status: 500 });
  }
}
