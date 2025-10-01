"use client";
//import { useChat } from "ai/react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, User } from "lucide-react";

export function AIChat() {
  return <>Not working</>;
  /*
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
  })

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-cyan-600" />
          SurfSense AI Assistant
        </CardTitle>
        <CardDescription>Ask me anything about surf conditions and recommendations</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 py-4">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 text-cyan-600" />
                <p className="text-sm">Ask me about surf conditions, spot recommendations, or forecasts!</p>
                <div className="mt-4 space-y-2 text-xs">
                  <p className="text-cyan-700">Try asking:</p>
                  <p>&quot;What are the best spots for beginners right now?&quot;</p>
                  <p>&quot;Where should I surf this weekend?&quot;</p>
                  <p>&quot;Tell me about Pipeline&apos;s conditions&quot;</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {message.role === "assistant" && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                      <Bot className="h-4 w-4 text-cyan-600" />
                    </div>
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[80%] ${
                    message.role === "user" ? "bg-cyan-600 text-white" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.role === "user" && (
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-cyan-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-cyan-100 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-cyan-600 animate-pulse" />
                  </div>
                </div>
                <div className="rounded-lg px-4 py-2 bg-gray-100">
                  <p className="text-sm text-gray-500">Thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about surf conditions..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
  */
}
