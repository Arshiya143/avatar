"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Send, Sparkles, Mic, Square, Menu, X } from "lucide-react";
import Image from "next/image";

type Message = {
  role: "user" | "assistant";
  content: string;
  audioURL?: string;
};

type Conversation = {
  id: number;
  title: string;
  messages: Message[];
};

export default function AIAssistant() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 1,
      title: "Welcome Chat",
      messages: [
        { role: "assistant", content: "Hello! How can I assist you today?" },
      ],
    },
  ]);
  const [currentConversation, setCurrentConversation] = useState(1);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const particles: Array<{
      x: number;
      y: number;
      radius: number;
      dx: number;
      dy: number;
      color: string;
    }> = [];
    const particleCount = 100;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        color: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.x += particle.dx;
        particle.y += particle.dy;

        if (particle.x < 0 || particle.x > canvas.width) particle.dx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.dy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() || audioURL) {
      const newMessage: Message = audioURL
        ? { role: "user", content: "Audio message", audioURL }
        : { role: "user", content: input };

      const updatedConversations = conversations.map((conv) => {
        if (conv.id === currentConversation) {
          return {
            ...conv,
            messages: [...conv.messages, newMessage],
          };
        }
        return conv;
      });
      setConversations(updatedConversations);
      setInput("");
      setAudioURL("");

      // Simulate AI response
      setTimeout(() => {
        const aiResponse: Message = {
          role: "assistant",
          content: "I received your message. How can I help further?",
        };
        const updatedWithAiResponse = updatedConversations.map((conv) => {
          if (conv.id === currentConversation) {
            return {
              ...conv,
              messages: [...conv.messages, aiResponse],
            };
          }
          return conv;
        });
        setConversations(updatedWithAiResponse);
      }, 1000);
    }
  };

  const startNewConversation = () => {
    const newId = conversations.length + 1;
    const newConversation: Conversation = {
      id: newId,
      title: `New Chat ${newId}`,
      messages: [
        {
          role: "assistant",
          content: "How can I assist you with this new conversation?",
        },
      ],
    };
    setConversations([...conversations, newConversation]);
    setCurrentConversation(newId);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      mediaRecorder.current.start();

      const audioChunks: BlobPart[] = [];
      mediaRecorder.current.addEventListener(
        "dataavailable",
        (event: BlobEvent) => {
          audioChunks.push(event.data);
        }
      );

      mediaRecorder.current.addEventListener("stop", () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioURL(audioUrl);
      });

      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state !== "inactive") {
      mediaRecorder.current.stop();
      setIsRecording(false);
    }
  };

   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

   const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-900 text-white">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      {/* Sidebar */}
      <div
        className={`fixed lg:relative z-20 w-64 h-full bg-black bg-opacity-60 lg:bg-gray-800 lg:bg-opacity-50 p-4 transform transition-transform lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Button onClick={startNewConversation} className="w-full mb-4 mt-14 lg:mt-0">
          <PlusCircle className="mr-2 h-4 w-4" /> New Chat
        </Button>
        <ScrollArea className="h-[calc(100vh-120px)]">
          {conversations.map((conv) => (
            <Button
              key={conv.id}
              onClick={() => setCurrentConversation(conv.id)}
              variant={currentConversation === conv.id ? "secondary" : "ghost"}
              className="w-full justify-start mb-2"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              {conv.title}
            </Button>
          ))}
        </ScrollArea>
      </div>

      {/* Menu Icon for Mobile */}
      <button
        className="fixed top-4 left-4 z-30 lg:hidden bg-gray-800 p-2 rounded-full"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <Menu className="h-6 w-6 text-white" />
        )}
      </button>

      {/* Main Chat Area */}
      <div className="flex w-full flex-col-reverse lg:flex-row">
        <div className="relative z-10 h-3/5 lg:h-full lg:flex-1 flex flex-col ">
          <ScrollArea className="flex-1 p-4 md:block">
            {conversations
              .find((conv) => conv.id === currentConversation)
              ?.messages.map((message, index) => (
                <div
                  key={index}
                  className={`mb-4 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg ${
                      message.role === "user" ? "bg-blue-600" : "bg-gray-700"
                    } max-w-[80%]`}
                  >
                    {message.audioURL ? (
                      <audio
                        controls
                        src={message.audioURL}
                        className="max-w-full"
                      >
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      message.content
                    )}
                  </div>
                </div>
              ))}
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="p-4 bg-gray-800 bg-opacity-50  md:block">
            <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 bg-gray-700 text-white border-gray-600"
              />
              {!isRecording ? (
                <Button type="button" onClick={startRecording}>
                  <Mic className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={stopRecording}
                  variant="destructive"
                >
                  <Square className="h-4 w-4" />
                </Button>
              )}
              <Button type="submit">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            {audioURL && (
              <div className="mt-2">
                <audio controls src={audioURL} className="max-w-full">
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </div>

        {/* Video Section */}
        <div className="flex flex-col justify-center items-center h-2/5 lg:h-full lg:w-1/2 bg-gray-800 md:bg-opacity-50">
          <div className="mb-4 text-lg font-semibold flex items-center">
            Talking Avatar
          </div>
          <div className="relative w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-gray-700 rounded-lg overflow-hidden">
            <Image
              src="/ava-img.png"
              alt="AI-Generated Avatar"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          </div>
          <p className="mt-2 text-sm text-gray-300 hidden md:block">
            This image represents an AI-generated visual response to your
            queries.
          </p>
        </div>
      </div>
    </div>
  );
}
