"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, User, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import ParchmentTexture from "@/components/parchment-texture"
import GeometricPattern from "@/components/geometric-pattern"

type Message = {
  id: string
  content: string
  isUser: boolean
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "Welcome to Ziryab, your guide to Islamic studies and Arabic science. How may I assist you today?",
      isUser: false,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sendButtonPressed, setSendButtonPressed] = useState(false)
  const [newMessageId, setNewMessageId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [input])

  // Reset animation state for new message
  useEffect(() => {
    if (newMessageId) {
      const timer = setTimeout(() => {
        setNewMessageId(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [newMessageId])

  // Reset send button animation
  useEffect(() => {
    if (sendButtonPressed) {
      const timer = setTimeout(() => {
        setSendButtonPressed(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [sendButtonPressed])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim() || isLoading) return

    // Trigger send button animation
    setSendButtonPressed(true)

    // Add user message
    const messageId = Date.now().toString()
    const userMessage: Message = {
      id: messageId,
      content: input.trim(),
      isUser: true,
    }

    setMessages((prev) => [...prev, userMessage])
    setNewMessageId(messageId)
    setInput("")
    setIsLoading(true)

    // Simulate AI response (in a real app, this would be an API call)
    setTimeout(() => {
      const responses = [
        "In Islamic scholarship, the concept of 'Ilm (knowledge) is highly valued. The Prophet Muhammad (peace be upon him) said, 'Seeking knowledge is obligatory upon every Muslim.' This foundational principle led to the flourishing of sciences during the Islamic Golden Age.",
        "Al-Khwarizmi, a Persian mathematician, astronomer, and geographer, made significant contributions to algebra. His book 'Kitab al-Jabr wa-l-Muqabala' gave us the term 'algebra' and established it as an independent discipline.",
        "Ibn al-Haytham (Alhazen) revolutionized optics with his Book of Optics (Kitab al-Manazir), where he correctly explained vision as light reflecting off objects and entering the eye. His experimental method was a precursor to the modern scientific method.",
        "The House of Wisdom (Bayt al-Hikma) in Baghdad was a major intellectual center during the Islamic Golden Age. Scholars translated Greek, Persian, and Indian texts while making their own discoveries in mathematics, astronomy, medicine, and other fields.",
      ]

      const aiMessageId = Date.now().toString()
      const aiMessage: Message = {
        id: aiMessageId,
        content: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
      }

      setMessages((prev) => [...prev, aiMessage])
      setNewMessageId(aiMessageId)
      setIsLoading(false)

      // Vibrate on message received (mobile only)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <div className="flex flex-col h-[100dvh] relative overflow-hidden">
      {/* Parchment texture background */}
      <div className="absolute inset-0 pointer-events-none">
        <ParchmentTexture />
      </div>

      {/* Header with subtle shadow */}
      <header className="border-b border-[#8B1E3F]/20 bg-white/90 backdrop-blur-sm z-10 shadow-sm relative">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#6D1832] flex items-center justify-center mr-3 shadow-sm">
            <span className="text-white font-semibold text-sm">Z</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Ziryab Guide</h1>
            <p className="text-xs text-gray-500">Islamic Studies & Arabic Science</p>
          </div>
        </div>
      </header>

      {/* Messages with improved styling and animations */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex transition-opacity duration-300",
                message.isUser ? "justify-end" : "justify-start",
                newMessageId === message.id ? "animate-fade-in" : "opacity-100",
              )}
            >
              <div className="flex items-start max-w-[85%]">
                {!message.isUser && (
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#6D1832] flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm">
                    <span className="text-white font-semibold text-sm">Z</span>
                  </div>
                )}

                <div
                  className={cn(
                    "rounded-2xl px-4 py-3 transition-all duration-300 relative overflow-hidden",
                    message.isUser
                      ? "bg-gradient-to-br from-[#8B1E3F] to-[#6D1832] text-white rounded-tr-none shadow-md"
                      : "bg-white/95 border border-[#8B1E3F]/10 rounded-tl-none shadow-sm",
                  )}
                >
                  {/* Subtle geometric pattern inside bubbles */}
                  <div className="absolute inset-0 opacity-5 pointer-events-none">
                    <GeometricPattern />
                  </div>

                  <p className={cn("relative z-10 leading-relaxed", message.isUser ? "text-sm" : "text-[15px]")}>
                    {message.content}
                  </p>

                  {/* Time indicator */}
                  <div
                    className={cn("text-[10px] mt-1 text-right", message.isUser ? "text-white/70" : "text-gray-400")}
                  >
                    {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>

                {message.isUser && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 mt-1 flex-shrink-0 shadow-sm">
                    <User className="h-4 w-4 text-gray-600" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Enhanced loading animation */}
          {isLoading && (
            <div className="flex justify-start animate-fade-in">
              <div className="flex items-start max-w-[85%]">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#8B1E3F] to-[#6D1832] flex items-center justify-center mr-2 mt-1 flex-shrink-0 shadow-sm">
                  <span className="text-white font-semibold text-sm">Z</span>
                </div>
                <div className="bg-white/95 border border-[#8B1E3F]/10 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                  <div className="flex space-x-2 items-center h-6">
                    <div
                      className="w-2 h-2 rounded-full bg-[#8B1E3F] animate-pulse"
                      style={{ animationDelay: "0ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#8B1E3F] animate-pulse"
                      style={{ animationDelay: "300ms" }}
                    ></div>
                    <div
                      className="w-2 h-2 rounded-full bg-[#8B1E3F] animate-pulse"
                      style={{ animationDelay: "600ms" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced input area with animations */}
      <div className="border-t border-[#8B1E3F]/20 bg-white/90 backdrop-blur-sm p-4 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] relative z-10">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative flex items-end">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about Islamic studies or Arabic science..."
              className="min-h-[48px] max-h-[120px] pr-12 rounded-xl border-[#8B1E3F]/20 focus-visible:ring-[#8B1E3F]/30 resize-none shadow-sm transition-all duration-200 bg-white/80"
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              className={cn(
                "absolute right-2 bottom-2 h-9 w-9 rounded-full transition-all duration-300 shadow-sm",
                input.trim()
                  ? "bg-gradient-to-br from-[#8B1E3F] to-[#6D1832] hover:shadow-md"
                  : "bg-gray-200 text-gray-400",
                sendButtonPressed && input.trim() ? "scale-90" : "scale-100",
              )}
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          <div className="mt-2 text-xs text-center text-gray-500">
            <p>Explore the rich heritage of Islamic studies and Arabic science</p>
          </div>
        </form>
      </div>
    </div>
  )
}

