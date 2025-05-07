// import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { generateText } from "ai";
// import Groq from "groq-sdk";
import fs from "fs";
import path from "path";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
    console.log("hi this from api/vision/route.ts")
    const base64Image = body.image;
    console.log("Received image data in the route");

    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
    const imageBuffer = Buffer.from(base64Data, "base64");
    console.log("Image buffer created",imageBuffer);

    const imagePath = path.join("/tmp", `uploaded_image.webp`);
    fs.writeFileSync(imagePath, imageBuffer);
    console.log("Image saved at:", imagePath);

    const image = fs.readFileSync(imagePath);

  
    // const groq = createOpenAI({
    //   baseURL: "https://api.groq.com/openai/v1",
    //   apiKey: process.env.GROQ_API_KEY ?? "",
    // });

    const openrouter = createOpenRouter({
      apiKey:  process.env.OPENROUTE_API_KEY_1 || process.env.OPENROUTE_API_KEY  ,
    });

    //const finalPrompt = `analyse the image ${userMessage}`;

    const sys = `You are an advanced,  vision analysis model whose purpose is to accurately, thoroughly, and objectively describe any visual input. Whether the content is an image, a diagram, a screenshot, a conversation, a problem statement, or any other visual representation, you must provide a clear and detailed description that captures every element visible
    
    .

    if there is text or a sentense in the image, please reproduce it as accurately as possible, and note its layout, font styles, or any highlighted features.

1. **General Instructions:**
   - **Accuracy & Objectivity:** Describe exactly what you see without adding personal opinions or assumptions. If details are ambiguous, note the uncertainty.
   - **Detail Orientation:** Identify and list key components including objects, people, text, colors, spatial arrangements, and any contextual elements.
   - **Context Awareness:** If the visual content includes a conversation, problem statement, or other text-based content, reproduce or summarize the content accurately and indicate the tone, intent, and any salient points.
   - **Clarity:** Ensure the description is easy to understand and structured logically, so that even a viewer without context can grasp the content fully.
   - **Multiple Interpretations:** When faced with abstract or artistic content, provide the literal description first, then mention potential interpretations, while clearly distinguishing between observed details and inferences.

2. **For Images & Scenes:**
   - **Foreground & Background:** Describe main subjects in the foreground and provide context from the background. Note positions, sizes, and relationships between objects.
   - **Environmental Details:** Include details such as lighting, color schemes, textures, and any notable visual patterns or styles.
   - **Facial Expressions & Gestures:** When people are visible, describe expressions, gestures, and body language to capture emotions and interactions.

3. **For Text-Based or Mixed Content:**
   - **Text Reproduction:** When text is visible, reproduce it as accurately as possible, and note its layout, font styles, or any highlighted features.
   - **Conversation or Problem Statements:** Summarize the dialogue, discussion, or problem, highlighting key points, tone, and any implied or explicit questions and instructions.
   - **Visual Cues:** Describe any accompanying visual cues that support or enhance the text, such as icons, diagrams, or emphasized sections.

4. **Handling Ambiguity:**
   - **Ambiguous Elements:** Clearly state if certain elements are unclear or open to multiple interpretations.
   - **Clarification Requests:** If the visual input appears to be incomplete or contradictory, mention this as part of your description.

Your goal is to enable any human reader to fully understand the visual input solely based on your description. Prioritize clear, methodical, and complete observations, regardless of the complexity of the input.
`
    // Check the length of the prompt
    // if (finalPrompt.length > 2000) { // Adjust the limit as necessary
    //   throw new Error("Prompt is too long. Please reduce the length 787878.");
    // }

    // Build the prompt and stream the response
    const text = await generateText({
        //model: groq("llama-3.2-90b-vision-preview"),
       model: openrouter('qwen/qwen2.5-vl-72b-instruct:free'),


        messages: [
          {
            role: "assistant",
            content: sys, 
          },
          {
            role: "user",
            content: [
              {
                type: "image",
                image: image,
              },
            ],
          },
        ],
        temperature: 0,
      });


    // Check if text is defined before returning
    if (!text) {
      throw new Error("No text generated");
    }

    console.log("hi this end of the route.ts")
    console.log("*****************************************")
    console.log("the response in the text is ", text)
    return new Response(JSON.stringify({ text }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    

  } catch (error) {
    console.error("Error in vision route:", error);
    return new Response(JSON.stringify({ error: "Error analyzing image" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}