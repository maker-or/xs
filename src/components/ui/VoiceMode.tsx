"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Mic, MicOff, ArrowLeft, VolumeX } from "lucide-react";

interface VoiceModeProps {
  onSubmit: (text: string) => Promise<void>;
  onExit: () => void;
  lastResponse?: string; // Add prop for the last AI response
}

const VoiceMode: React.FC<VoiceModeProps> = ({
  onSubmit,
  onExit,
  lastResponse,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visualizerValues, setVisualizerValues] = useState<number[]>(
    Array(30).fill(5),
  );
  const [animatedPulse, setAnimatedPulse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [lastSubmittedText, setLastSubmittedText] = useState<string | null>(
    null,
  );
  const [aiResponse, setAiResponse] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  console.log(animatedPulse);
  console.log(onSubmit);
  console.log(aiResponse);

  // Replace function declaration with useCallback to stabilize reference
  const speakResponse = useCallback(
    async (text: string) => {
      // Function to speak the response
      if (!text || isSpeaking) return;

      try {
        setIsSpeaking(true);
        setError(null);

        console.log("Sending text to TTS API:", text.substring(0, 50) + "...");

        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            // Using nova voice for better quality, you can change this to alloy, echo, fable, onyx, or shimmer
          }),
        });

        if (!response.ok && response.status !== 200) {
          throw new Error(
            `TTS request failed: ${response.status} ${response.statusText}`,
          );
        }

        // Check if response is JSON (browser TTS fallback) or audio
        const contentType = response.headers.get("Content-Type") || "";

        if (contentType.includes("application/json")) {
          // This is a fallback response - use browser's speech synthesis
          const data = await response.json();

          if (data.useBrowserTTS) {
            console.log(
              "Using browser's speech synthesis as instructed by server",
            );

            if (!window.speechSynthesis) {
              throw new Error("Browser doesn't support speech synthesis");
            }

            speakWithBrowserTTS(data.text || text);
            return; // Early return after setting up browser TTS
          } else if (data.error) {
            throw new Error(data.error);
          }
        } else {
          // Regular audio response
          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioSrc(audioUrl);

          if (audioRef.current) {
            audioRef.current.onended = () => {
              setIsSpeaking(false);
              // Clean up the object URL
              URL.revokeObjectURL(audioUrl);
            };

            audioRef.current.onerror = (e) => {
              console.error("Audio playback error:", e);
              setIsSpeaking(false);
              setError("Error during audio playback");

              // Try browser TTS as final fallback
              if (window.speechSynthesis) {
                try {
                  speakWithBrowserTTS(text);
                } catch (e) {
                  console.error("Browser TTS fallback failed:", e);
                  setIsSpeaking(false);
                }
              }
            };

            // Play the audio
            console.log("Playing audio response...");
            audioRef.current.play().catch((err) => {
              console.error("Error playing audio:", err);
              setError(`Error playing audio: ${err.message}`);
              setIsSpeaking(false);

              // Try browser TTS as final fallback
              if (window.speechSynthesis) {
                try {
                  speakWithBrowserTTS(text);
                } catch (e) {
                  console.error("Browser TTS fallback failed:", e);
                  setIsSpeaking(false);
                }
              }
            });
          }
        }
      } catch (error) {
        console.error("Error in TTS workflow:", error);
        setError(
          `Failed to play audio response: ${error instanceof Error ? error.message : "Unknown error"}`,
        );

        // Final fallback to browser TTS
        if (window.speechSynthesis) {
          try {
            console.log("Using browser's speech synthesis as final fallback");
            speakWithBrowserTTS(text);
            return;
          } catch (e) {
            console.error("Browser speech synthesis fallback failed:", e);
          }
        }

        setIsSpeaking(false);
      }
    },
    [isSpeaking],
  );

  // Update the conversation history when lastResponse changes
  useEffect(() => {
    if (lastResponse && lastSubmittedText) {
      // Only add new responses if they're different from what's already in the history
      const isNewUserMessage = !conversationHistory.some(
        (item) => item.role === "user" && item.text === lastSubmittedText,
      );

      const isNewAssistantMessage = !conversationHistory.some(
        (item) => item.role === "assistant" && item.text === lastResponse,
      );

      const updatedHistory = [...conversationHistory];

      if (isNewUserMessage) {
        updatedHistory.push({ role: "user" as const, text: lastSubmittedText });
      }

      if (isNewAssistantMessage) {
        updatedHistory.push({ role: "assistant" as const, text: lastResponse });
        // Automatically speak the new response
        speakResponse(lastResponse);
      }

      setConversationHistory(
        updatedHistory as { role: "user" | "assistant"; text: string }[],
      );
      setLastSubmittedText(null);
    }
  }, [lastResponse, lastSubmittedText, conversationHistory, speakResponse]);

  // Cleanup effect
  useEffect(() => {
    const audioElement = audioRef.current;
    return () => {
      stopVisualization();
      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
      }
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    alert("Voice mode is still experimental and may make mistakes.");
  }, []);

  // Extract browser speech synthesis to a separate function with better error handling
  const speakWithBrowserTTS = (text: string) => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported");
      setIsSpeaking(false);
      return;
    }

    try {
      // First cancel any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Configure the utterance
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to set a good voice - do this with a timeout to ensure voices are loaded
      setTimeout(() => {
        try {
          const voices = window.speechSynthesis.getVoices();
          const englishVoices = voices.filter((voice) =>
            voice.lang.includes("en"),
          );

          if (englishVoices.length > 0) {
            // Sort by quality - prefer Google, Microsoft, or Apple voices if available
            const preferredVoice = englishVoices.find(
              (v) =>
                v.name.includes("Google") ||
                v.name.includes("Microsoft") ||
                v.name.includes("Samantha") ||
                v.name.includes("Daniel"),
            );

            // Fix TypeScript error by ensuring we never assign undefined
            utterance.voice = preferredVoice || englishVoices[0] || null;
            console.log(`Using voice: ${utterance.voice?.name || 'default'}`);
          }
        } catch (e) {
          console.warn("Could not set preferred voice:", e);
        }
      }, 100);

      // Set up event handlers with improved error handling
      utterance.onend = () => {
        console.log("Browser speech synthesis finished");
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        // Create a more detailed error message
        const errorDetails = {
          error: event.error || "unknown",
          message: "No additional error details available", // SpeechSynthesisErrorEvent doesn't have a message property
          isCancelled:
            window.speechSynthesis.pending === false &&
            window.speechSynthesis.speaking === false,
        };

        console.error("Browser speech synthesis error:", errorDetails);

        // If the error is just a cancellation, don't show an error
        if (errorDetails.isCancelled) {
          console.log(
            "Speech was cancelled - this is expected during normal operation",
          );
        } else {
          setError(
            `Speech playback error: ${errorDetails.error}. ${errorDetails.message}`,
          );
        }

        setIsSpeaking(false);
      };

      // Add safety timeout - if speech doesn't end naturally after 10 seconds per 100 chars
      // (with a minimum of 10 seconds and maximum of 2 minutes), force it to end
      const timeoutDuration = Math.min(
        120000,
        Math.max(10000, text.length * 100),
      );
      const speechTimeout = setTimeout(() => {
        if (window.speechSynthesis.speaking) {
          console.warn("Speech synthesis taking too long, forcing stop");
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      }, timeoutDuration);

      // Speak
      window.speechSynthesis.speak(utterance);

      // Chrome and some browsers have a bug where speech synthesis stops after ~15 seconds
      // Add a workaround to restart it if it stops unexpectedly
      const resumeInterval = setInterval(() => {
        if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
          // This is a hack to keep speech synthesis going
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else if (!window.speechSynthesis.speaking && 
                  window.speechSynthesis.pending === false) {
          // Speech is done, clean up
          clearInterval(resumeInterval);
          clearTimeout(speechTimeout);
          setIsSpeaking(false);
        }
      }, 5000);

      // Clean up function
      return () => {
        clearInterval(resumeInterval);
        clearTimeout(speechTimeout);
      };
    } catch (e) {
      console.error("Error in browser speech synthesis:", e);
      setError(
        `Browser speech synthesis error: ${e instanceof Error ? e.message : "Unknown error"}`,
      );
      setIsSpeaking(false);
    }
  };

  // New function to process the chat request directly in voice mode
  const processVoiceRequest = async (text: string) => {
    if (!text.trim()) return;

    try {
      setIsProcessing(true);
      setError(null);

      // Add user message to conversation history immediately
      const updatedHistory = [
        ...conversationHistory,
        { role: "user" as const, text: text },
      ];

      setConversationHistory(updatedHistory);

      // Prepare the messages array for the API request
      const messages = updatedHistory.map((item) => ({
        role: item.role,
        content: item.text,
      }));

      console.log("Sending voice request to API with messages:", messages);

      // Call the chat API directly from the voice mode
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          model: "deepseek/deepseek-chat-v3-0324:free", // Default model or update as needed
          voiceMode: true, // Flag to indicate this is a voice interaction
        }),
      });

      if (!response.ok) {
        // Handle non-streaming error responses
        try {
          const errorData = await response.json();
          throw new Error(
            errorData.error ||
              `Chat request failed: ${response.status} ${response.statusText}`,
          );
        } catch (jsonError) {
          // If it's not JSON, get the raw text
          console.log(jsonError);
          const errorText = await response.text().catch(() => null);
          throw new Error(
            `Chat request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ""}`,
          );
        }
      }

      // Check if this is a JSON response rather than a stream (happens in some error cases)
      const contentType = response.headers.get("Content-Type") || "";
      if (contentType.includes("application/json")) {
        const jsonData = await response.json();
        if (jsonData.error) {
          throw new Error(jsonData.error);
        }
        if (jsonData.text) {
          // Handle case where API returns direct text instead of a stream
          setAiResponse(jsonData.text);
          setConversationHistory([
            ...updatedHistory,
            { role: "assistant", text: jsonData.text },
          ]);
          speakResponse(jsonData.text);
          return;
        }
      }

      if (!response.body) {
        throw new Error("Response body is null - no stream available");
      }

      // Process the streaming response
      const reader = response.body.getReader();
      let responseText = "";
      let hasReceivedData = false;

      // Set a timeout to detect if we're not receiving any data
      const responseTimeout = setTimeout(() => {
        if (!hasReceivedData && isProcessing) {
          console.error(
            "Response timeout - no data received within timeout period",
          );
          setError("Response timeout - no data received from server");
          setIsProcessing(false);

          // Add fallback message to conversation history
          const fallbackMessage =
            "I'm sorry, I couldn't generate a response at this time. Please try again.";
          setConversationHistory([
            ...updatedHistory,
            { role: "assistant", text: fallbackMessage },
          ]);

          // Speak the fallback message
          speakResponse(fallbackMessage);
        }
      }, 15000); // 15 second timeout

      try {
        console.log("Processing streaming response...");
        let processing = true;
        while (processing) {
          const { done, value } = await reader.read();

          if (done) {
            console.log("Stream complete");
            processing = false;
            continue;
          }

          if (value && value.byteLength > 0) {
            hasReceivedData = true;

            // Convert the chunk to text
            const chunk = new TextDecoder().decode(value);
            console.log(
              "Received chunk:",
              chunk.substring(0, 100) + (chunk.length > 100 ? "..." : ""),
            );

            // Handle different streaming formats
            try {
              const lines = chunk.split("\n");
              for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine === "") continue;

                // Case 1: Standard SSE format - most common case
                if (trimmedLine.startsWith("data: ")) {
                  const content = trimmedLine.slice(6).trim();
                  if (content === "[DONE]") continue;

                  try {
                    const parsed = JSON.parse(content);

                    // Handle various JSON response formats
                    if (parsed.choices && parsed.choices[0]?.delta?.content) {
                      // OpenAI chat completion format
                      responseText += parsed.choices[0].delta.content;
                    } else if (
                      parsed.choices &&
                      parsed.choices[0]?.message?.content
                    ) {
                      // Alternative OpenAI format
                      responseText += parsed.choices[0].message.content;
                    } else if (parsed.content) {
                      // Simple content field format
                      responseText += parsed.content;
                    } else if (parsed.text) {
                      // Simple text field format
                      responseText += parsed.text;
                    } else if (typeof parsed === "string") {
                      // Direct string format
                      responseText += parsed;
                    } else if (parsed.message) {
                      // Error message format
                      console.warn("Error message in stream:", parsed.message);
                      // Don't add error messages to the response
                    }
                  } catch (parseError) {
                    console.warn(
                      `JSON parse error in data line: ${parseError}. Content: ${content.substring(0, 50)}...`,
                    );

                    // If it looks like plain text (not JSON), add it directly
                    if (
                      !content.includes("{") &&
                      !content.includes("}") &&
                      !content.startsWith('"')
                    ) {
                      responseText += content;
                    } else {
                      // Try to extract content with regex for malformed JSON
                      const contentMatch =
                        content.match(/"content":"([^"]*)"/) ||
                        content.match(/"text":"([^"]*)"/);
                      if (contentMatch && contentMatch[1]) {
                        responseText += contentMatch[1];
                      }
                    }
                  }
                }
                // Case 2: Raw text without SSE formatting
                else if (
                  !trimmedLine.includes("{") &&
                  !trimmedLine.includes("}")
                ) {
                  responseText += trimmedLine + " ";
                }
                // Case 3: JSON object without SSE formatting
                else {
                  try {
                    const parsed = JSON.parse(trimmedLine);
                    if (parsed.text) {
                      responseText += parsed.text;
                    } else if (parsed.content) {
                      responseText += parsed.content;
                    } else if (parsed.message) {
                      // Message might be an error or informational
                      console.log("Message in JSON stream:", parsed.message);
                    }
                  } catch (parseError) {
                    // Try regex extraction as last resort
                    console.warn(`Failed to parse non-SSE JSON: ${parseError}`);
                    const contentMatch =
                      trimmedLine.match(/"content":"([^"]*)"/) ||
                      trimmedLine.match(/"text":"([^"]*)"/);
                    if (contentMatch && contentMatch[1]) {
                      responseText += contentMatch[1];
                    }
                  }
                }
              }

              // Update the AI response in real-time with cleaned text
              if (responseText.trim()) {
                setAiResponse(responseText.trim());
              }
            } catch (e) {
              console.error("Error processing response chunk:", e);
              // Try to salvage any text from the chunk as a last resort
              if (chunk && !chunk.startsWith("{") && !chunk.endsWith("}")) {
                responseText += chunk;
                setAiResponse(responseText.trim());
              }
            }
          }
        }
      } catch (streamError) {
        console.error("Error processing stream:", streamError);
        if (!hasReceivedData) {
          throw new Error(
            `Failed to process stream: ${streamError instanceof Error ? streamError.message : "Unknown error"}`,
          );
        }
      } finally {
        clearTimeout(responseTimeout);
      }

      // Clean up the response text
      const cleanedText = responseText
        .replace(/^data: /gm, "")
        .replace(/\[DONE\]/g, "")
        .replace(/```[\s\S]*?```/g, "") // Remove code blocks for voice
        .replace(/{[^}]*}/g, "") // Remove any remaining JSON objects
        .replace(/\n+/g, "\n") // Normalize newlines
        .replace(/\s{2,}/g, " ") // Normalize spacing
        // Handle various numbered token formats
        .replace(/\d+:"([^"]+)"\s*/g, "$1") // Format like 0:"Hello" 1:"world"
        .replace(/\d+: "([^"]+)"\s*/g, "$1") // Format with space after number
        .replace(/\d+:([^ ]+)\s*/g, "$1") // Format like 0:Hello 1:world
        .replace(/token_\d+:"([^"]+)"\s*/g, "$1") // Format with token_ prefix
        // Remove any parenthetical comments about voice mode formatting
        .replace(/\([^)]*voice mode[^)]*\)/gi, "")
        .replace(/\(Response kept [^)]*\)/gi, "")
        .trim();

      if (cleanedText) {
        console.log(`Final cleaned response (${cleanedText.length} chars)`);

        // Add the complete AI response to conversation history
        setConversationHistory([
          ...updatedHistory,
          { role: "assistant", text: cleanedText },
        ]);

        // Automatically speak the cleaned response
        console.log("Speaking cleaned response...");
        await speakResponse(cleanedText);
      } else {
        // Enhanced empty response handling
        console.error("Server returned empty or unparseable response");
        const fallbackMessage =
          "I'm sorry, I couldn't generate a response at this time. Please try again.";

        // Add fallback message to conversation history
        setConversationHistory([
          ...updatedHistory,
          { role: "assistant", text: fallbackMessage },
        ]);

        // Speak the fallback message
        await speakResponse(fallbackMessage);

        // Set a more user-friendly error
        setError(
          "No response received from server. I've provided a fallback response instead.",
        );
      }
    } catch (error) {
      console.error("Error processing voice request:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to process your request";
      setError(errorMessage);

      // Provide a fallback response in the conversation history
      const fallbackMessage =
        "I'm sorry, I encountered an error processing your request. Please try again.";
      setConversationHistory([
        ...conversationHistory,
        { role: "user", text: text },
        { role: "assistant", text: fallbackMessage },
      ]);

      // Speak the fallback message
      await speakResponse(fallbackMessage);
    } finally {
      setIsProcessing(false);
      setTranscribedText("");
      setAiResponse(null);
    }
  };

  const startRecording = async () => {
    // Don't start recording if TTS is speaking
    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    try {
      setError(null);
      setTranscribedText("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Set up audio visualizer
      setupAudioVisualizer(stream);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stopVisualization();
        setIsProcessing(true);
        setAnimatedPulse(true);

        try {
          // Create a File from the collected audio chunks
          const audioFile = new File(audioChunksRef.current, "recording.wav", {
            type: "audio/wav",
          });

          // Create form data to send to the server
          const formData = new FormData();
          formData.append("audio", audioFile);
          formData.append("model", "distil-whisper-large-v3-en");

          // Send to our transcription API
          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(
              "Transcription failed:",
              response.status,
              response.statusText,
              errorData,
            );
            throw new Error(
              `Transcription failed: ${response.statusText}${errorData ? ` - ${errorData.error}` : ""}`,
            );
          }

          const data = await response.json();
          const transcribed =
            data.text || "Sorry, I couldn't transcribe that. Please try again.";
          setTranscribedText(transcribed);

          console.log("+++++++++++++++++++++++++++");
          console.log("this is beinging transcribed: ", transcribed);
          console.log("+++++++++++++++++++++++++++");

          // Automatically process the transcribed text if it's valid
          if (
            transcribed &&
            transcribed !==
              "Sorry, I couldn't transcribe that. Please try again."
          ) {
            // Process the voice request
            await processVoiceRequest(transcribed);
          }
        } catch (error) {
          console.error("Error transcribing audio:", error);
          setError(
            error instanceof Error
              ? error.message
              : "Failed to transcribe audio. Please try again.",
          );
          setTranscribedText("");
        } finally {
          setIsProcessing(false);
          setAnimatedPulse(false);

          // Stop all tracks from the stream
          stream.getTracks().forEach((track) => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      setError("Failed to access microphone. Please check your permissions.");
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    // Also cancel any browser speech synthesis that might be happening
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
  };

  // Rest of visualization methods remain the same
  const setupAudioVisualizer = (stream: MediaStream) => {
    try {
      // Create audio context
      const AudioContextClass = (window.AudioContext ||
        (window as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext) as typeof AudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;

      // Create analyser
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      // Create source from stream
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;

      // Start visualization
      startVisualization();
    } catch (error) {
      console.error("Error setting up audio visualizer:", error);
    }
  };

  const startVisualization = () => {
    if (!analyserRef.current) return;

    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);

    const updateVisualizer = () => {
      analyser.getByteFrequencyData(dataArray);

      // Process data to create smooth visualizer values
      const values = Array(30).fill(0);
      const binSize = Math.floor(dataArray.length / 30);

      for (let i = 0; i < 30; i++) {
        let sum = 0;
        for (let j = 0; j < binSize; j++) {
          sum += dataArray[i * binSize + j] ?? 0;
        }
        // Scale from 0-255 to 5-30 (min height 5px, max 30px)
        values[i] = 5 + Math.floor((sum / binSize) * 0.1);
      }

      setVisualizerValues(values);
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    };

    animationFrameRef.current = requestAnimationFrame(updateVisualizer);
  };

  const stopVisualization = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }

    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(console.error);
      }
      audioContextRef.current = null;
    }

    analyserRef.current = null;
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSendTranscription = async () => {
    if (transcribedText.trim()) {
      await processVoiceRequest(transcribedText);
    }
  };
  console.log(handleSendTranscription);

  return (
    <div className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center z-50">
      <div className="absolute top-4 bg-transpert border-2 border-[#575555] rounded-lg left-4">
        <button
          onClick={onExit}
          className="p-3 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 dark:text-white text-gray-800" />
        </button>
      </div>

      <audio ref={audioRef} src={audioSrc || undefined} className="hidden" />

      <div className="flex flex-col items-center justify-center space-y-8 w-full max-w-lg p-8">
        <h1 className="text-[3em] font-serif text-center dark:text-white text-gray-800">
          Sphere
        </h1>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        <div className="relative flex items-center justify-center w-full">
          {/* Single Circle with consistent orange theme */}
          <div
            className="w-[40svh] h-[40svh] rounded-full flex items-center border-2 border-[#251207] justify-center relative overflow-hidden"
            style={{
              background:
                "linear-gradient(49.71deg, #000000 16.4%, #FF5E00 111.47%)",
              transition: "all 300ms ease-in-out",
            }}
          >
            {/* Audio visualizer for recording */}
            {isRecording && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-end justify-center h-20 gap-[2px] px-2 w-full">
                  {visualizerValues.map((value, index) => (
                    <div
                      key={index}
                      style={{
                        height: `${value}px`,
                        backgroundColor: "#FF5E00",
                      }}
                      className="w-1 rounded-full transition-all duration-100"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Processing pulse animation */}
            {isProcessing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full animate-ping opacity-75"
                  style={{ backgroundColor: "#FF5E00" }}
                ></div>
              </div>
            )}

            {/* Speaking animation */}
            {isSpeaking && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full animate-pulse opacity-75"
                  style={{ backgroundColor: "#FF5E00" }}
                ></div>
              </div>
            )}

            {/* Control Button */}
            <button
              onClick={
                isSpeaking
                  ? stopSpeaking
                  : isRecording
                    ? stopRecording
                    : startRecording
              }
              disabled={isProcessing}
              className="relative z-10 w-24 h-24 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed  hover:bg-orange-600"
              // style={{
              //   backgroundColor: '#FF5E00'
              // }}
            >
              {isRecording ? (
                <MicOff className="h-10 w-10 text-[#FF5E00]" />
              ) : isSpeaking ? (
                <VolumeX className="h-10 w-10 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-transparent" />
              )}
            </button>
          </div>
        </div>

        <div className="text-center w-full">
          {isRecording && (
            <p className="animate-pulse text-lg" style={{ color: "#FF5E00" }}>
              Listening...
            </p>
          )}
          {isProcessing && (
            <p className="text-lg" style={{ color: "#FF5E00" }}>
              Processing speech...
            </p>
          )}
          {isSpeaking && (
            <p className="animate-pulse text-lg" style={{ color: "#FF5E00" }}>
              Speaking...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceMode;
