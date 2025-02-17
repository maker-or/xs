// import { createOpenAI } from "@ai-sdk/openai";
// import { streamText } from "ai";
// import Groq from "groq-sdk";

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
//     console.log("hi this from api/vision/route.ts")
//     const base64Image = body.image;
//     console.log("Received image data in the route");

    

    
//     const groq = createOpenAI({
//       baseURL: "https://api.groq.com/openai/v1",
//       apiKey: process.env.GROQ_API_KEY ?? "",
//     });

//     const finalPrompt = `analyse the image ${base64Image}`;
    
//     // Build the prompt and stream the response
//     const response = streamText({
//       model: groq("llama-3.2-90b-vision-preview"), // Use the correct vision model
//       system: "You are a highly skilled observer with the ability to notice even the smallest details in images. Your task is to describe everything you see clearly and concisely.",
//       prompt: finalPrompt,
//       temperature: 0,
//     });
//     console.log("hi this end of the route.ts")
//     console.log("*****************************************")
//     console.log("the reposne in the text is ", response.text)
//     return response.text;

//   } catch (error) {
//     console.error("Error in vision route:", error);
//     return new Response(JSON.stringify({ error: "Error analyzing image" }), {
//       status: 500,
//       headers: { "Content-Type": "application/json" },
//     });
//   }
// }