
import { questionsArraySchema } from './schemas';
import { Pinecone } from '@pinecone-database/pinecone';
import { getEmbedding } from '~/utils/embeddings';
import {  generateText } from 'ai';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';


export async function generateQuestions({
  subject,
  topic,
  num_questions,
  difficulty,
}: {
  subject: string;
  topic?: string;
  num_questions: number;
  difficulty: string;
}) {
  try {

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
            model: openrouter('meta-llama/llama-3.3-70b-instruct:free'),
            prompt: sub,
            temperature: 0,
        });
        // Create embeddings
        const queryEmbedding = await getEmbedding(subject);
        const index = pinecone.index(i.text);
        const queryResponse = await index.namespace('').query({
            vector: queryEmbedding,
            topK: 7,
            includeMetadata: true,
        });

        if (!queryResponse.matches || queryResponse.matches.length === 0) {
            throw new Error('No relevant context found in Pinecone');
        }

    // Generate twice the number of questions for better variety and randomization
    const questionsToGenerate = num_questions * 2;

    // Log the request for troubleshooting
    console.log('Generating questions for:', { subject, topic, requested: num_questions, generating: questionsToGenerate, difficulty });

      const context = queryResponse.matches.map((match) => String(match.metadata?.text ?? '')).join('\n\n');

    // Construct the prompt based on inputs - generate double the questions
    const prompt = `
    Generate ${questionsToGenerate} multiple-choice questions (MCQs) for a ${difficulty} level exam on ${subject}${topic ? ` focusing on the topic "${topic}"` : ''}.

    Each question should have exactly 4 options with only one correct answer.
    Make sure all questions are unique and cover different aspects of the topic.

    Format your response as a valid JSON array of objects where each object has:
    - "question": The question text
    - "options": An array of 4 possible answers
    - "correct_answer": The index (0-3) of the correct option

    Example format:
    [
      {
        "question": "What is the capital of France?",
        "options": ["Berlin", "Madrid", "Paris", "Rome"],
        "correct_answer": 2
      }
    ]

    Make sure the difficulty level is appropriate (${difficulty}).
    - Easy: Basic knowledge and understanding
    - Medium: Application and analysis
    - Hard: Evaluation and synthesis of complex concepts

    Provide only the JSON array in your response with no additional text.
    Ensure you generate exactly ${questionsToGenerate} unique questions.

    Here is some relevant context: ${context}
    `;

    // Make the API call to OpenRouter
       const response = await generateText({
            model: openrouter('meta-llama/llama-4-maverick:free'),
            prompt: prompt,
            system: `You are an expert question creator for educational tests. Your task is to generate multiple-choice questions (MCQs) based on the provided topic, difficulty level, and context.

Difficulty levels are defined as follows:
- Easy: Questions that test basic understanding or recall of facts.
- Medium: Questions that require application of concepts or some reasoning.
- Hard: Questions that involve analysis, evaluation, or synthesis of information.

Instructions:
- Analyze the provided context to identify key concepts, facts, or principles related to the topic.
- Create ${questionsToGenerate} MCQs that cover a range of subtopics within the context and are not repetitive.
- Each question must be directly supported by the information in the context.
- Ensure that each question is clearly worded, concise, and has only one correct answer.
- Provide four plausible options for each question, including distractors that reflect common misconceptions or errors.
- All options should be consistent in terms of length, complexity, and grammatical structure.
- Specify the correct answer by its index (0 for the first option, 1 for the second, etc.).
- Generate exactly ${questionsToGenerate} unique questions to provide variety for question selection.

Ensure that each question is unique and covers different aspects of the topic.`


        });
    // Get the text response
    const content = response.text || '[]';

    // Try to parse the JSON response
    try {
      // Clean the response: sometimes it returns markdown code blocks or other text
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(jsonStr);

      // Validate the response structure using Zod
      const validatedQuestions = questionsArraySchema.parse(parsed);

      // Check if we have enough questions generated (should be 2x the requested amount)
      if (validatedQuestions.length < num_questions) {
        console.warn(`Only generated ${validatedQuestions.length} questions, but at least ${num_questions} were needed`);
        return {
          questions: validatedQuestions, // Return what we have
          error: null,
        };
      }

      // Return ALL generated questions - selection will happen per-student in the API
      console.log('Successfully generated questions:', validatedQuestions.length, 'for question pool');

      return {
        questions: validatedQuestions, // Return all questions for the pool
        error: null,
      };
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError);
      console.error('Raw response:', content);

      return {
        questions: [],
        error: 'Failed to parse AI-generated questions. Please try again.',
      };
    }
  } catch (error) {
    console.error('Error calling LLM API:', error);

    return {
      questions: [],
      error: 'Failed to generate questions using AI. Please try again.',
    };
  }
}
