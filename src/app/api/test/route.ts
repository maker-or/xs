import { NextRequest, NextResponse } from 'next/server';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '~/utils/embeddings';
import { generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';


export async function POST(request: NextRequest) {
    try {
        // Parse the form data from the request
        const formData = await request.json();
        const { subject, topic, difficulty, numberOfQuestions, time } = formData;
        console.log(time)

        const pinecone = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY ?? '',
        });


        const openrouter = createOpenRouter({
            apiKey: process.env.OPENROUTE_API_KEY ?? "",
        });

        const sub = `
      You are a query classifier. Your task is to categorize a given query into one of the following subjects and return only the corresponding subject tag. Do not include any other text,symbols or information in your response even the new line.
      
      The possible subject categories and their tags are:
      
      *   Compiler Design: cd
      *   Data Analysis and Algorithms: daa
      *   Data Communication and Networking/CRYPTOGRAPHY AND NETWORK SECURITY: ol
      *   Engineering Economics and Management: eem
      *   Chemistry : chemistry
      
      Analyze the following query: "${subject} and ${topic}" and return the appropriate tag.`;

        const i = await generateText({
            //model: groq('llama-3.3-70b-versatile'),
            model: openrouter('google/gemma-3-27b-it:free'),
            prompt: sub,
            temperature: 0,
        });
        // Create embeddings
        const queryEmbedding = await getEmbedding(topic);
        const index = pinecone.index(i.text);
        const queryResponse = await index.namespace('').query({
            vector: queryEmbedding,
            topK: 7,
            includeMetadata: true,
        });

        if (!queryResponse.matches || queryResponse.matches.length === 0) {
            throw new Error('No relevant context found in Pinecone');
        }




        // Extract relevant context
        const context = queryResponse.matches.map((match) => String(match.metadata?.text ?? '')).join('\n\n');

        const finalPrompt = `
        You are an expert question creator for educational tests.
        
        Topic: ${topic}
        Difficulty: ${difficulty}
        Number of questions: ${numberOfQuestions}
        Context:${context}
        
        Based on the following context, create ${numberOfQuestions} multiple-choice questions (MCQs) related to the topic.
        
        
        
      `;




        const result = await generateText({
            model: openrouter('google/gemma-3-27b-it:free'),
            prompt: finalPrompt,
            system: `You are an expert question creator for educational tests. Your task is to generate multiple-choice questions (MCQs) based on the provided topic, difficulty level, and context.

Topic: {topic}
Difficulty: {difficulty}
Number of questions: {numberOfQuestions}
Context: {context}

Difficulty levels are defined as follows:
- Easy: Questions that test basic understanding or recall of facts.
- Medium: Questions that require application of concepts or some reasoning.
- Hard: Questions that involve analysis, evaluation, or synthesis of information.



Instructions:
- Analyze the provided context to identify key concepts, facts, or principles related to the topic.
- Create {numberOfQuestions} MCQs that cover a range of subtopics within the context and are not repetitive.
- Each question must be directly supported by the information in the context.
- Ensure that each question is clearly worded, concise, and has only one correct answer.
- Provide four plausible options for each question, including distractors that reflect common misconceptions or errors.
- All options should be consistent in terms of length, complexity, and grammatical structure.
- Specify the correct answer by its index (0 for the first option, 1 for the second, etc.).

Format your response as a JSON array of question objects with the following structure:
[
  {
    "id": 1,
    "text": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  },
  ...
]

Ensure that the 'id' is unique and increments from 1 to {numberOfQuestions}.`


        });

        // Log raw response for debugging
        console.log('Raw AI response:', result.text);

        let questions;
        try {
            // Clean up the response text to ensure it's valid JSON
            let cleanedText = result.text.trim();

            // If the response starts with ``` or ends with ```, remove the markdown code block markers
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.substring(7);
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.substring(3);
            }

            if (cleanedText.endsWith('```')) {
                cleanedText = cleanedText.substring(0, cleanedText.length - 3);
            }

            cleanedText = cleanedText.trim();

            // Parse the cleaned text as JSON
            questions = JSON.parse(cleanedText);

            // Validate the result has the expected structure
            if (!Array.isArray(questions)) {
                throw new Error('Response is not an array');
            }

            // Ensure each question has the required properties
            questions = questions.map((q, index) => ({
                id: q.id || index + 1,
                text: q.text || `Question ${index + 1}`,
                options: Array.isArray(q.options) ? q.options : ["Option A", "Option B", "Option C", "Option D"],
                correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0
            }));

        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', parseError);

            // Fallback: create a simple placeholder question set
            questions = Array.from({ length: numberOfQuestions }, (_, i) => ({
                id: i + 1,
                text: `${topic} question ${i + 1}? (Error occurred during question generation)`,
                options: [
                    "Option A",
                    "Option B",
                    "Option C",
                    "Option D"
                ],
                correctAnswer: 0
            }));

            // You can also throw the error to the catch block instead of using a fallback
            // throw new Error(`Failed to parse AI response: ${parseError.message}`);
        }

        // Return the generated questions
        return NextResponse.json({
            success: true,
            questions,
        });
    } catch (error) {
        console.error('Error generating questions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to generate questions' },
            { status: 500 }
        );
    }
}