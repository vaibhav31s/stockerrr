'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Send, Bot, User, Loader2, MessageCircle, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface CategoryAnalysisChatProps {
  category: string
  analysis: string
  stocks: string[]
  stockDetails?: any[]
}

export function CategoryAnalysisChat({ category, analysis, stocks, stockDetails }: CategoryAnalysisChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Validate props
  if (!analysis || !category || !stocks || stocks.length === 0) {
    console.warn('CategoryAnalysisChat: Missing required props', { analysis: !!analysis, category, stockCount: stocks?.length })
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        role: 'assistant',
        content: `Hi! 👋 I've analyzed your **${category}** portfolio with ${stocks.length} stocks.

**You can ask me:**
- Which stock should I buy/sell?
- What are the entry and exit points?
- What are the major risks?
- How should I rebalance my portfolio?
- Any specific questions about individual stocks

Just type your question below!`,
        timestamp: new Date().toISOString()
      }])
    }
  }, [isOpen, category, stocks.length])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    const messageToSend = input
    setInput('')
    setIsLoading(true)

    try {
      console.log('Sending message to chat API:', { category, messageToSend })
      
      const response = await fetch('/api/watchlist/chat-category', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          category,
          analysis,
          stocks,
          stockDetails,
          conversationHistory: messages.slice(-6) // Last 6 messages for context
        })
      })

      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)

      if (data.error) {
        throw new Error(data.error)
      }

      if (data.response) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: data.response,
          timestamp: data.timestamp || new Date().toISOString()
        }])
      } else {
        throw new Error('No response from AI')
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full mt-4"
        variant="outline"
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Ask Questions About This Analysis
      </Button>
    )
  }

  return (
    <Card className="w-full mt-4 border-2 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" />
            Chat with AI About {category} Analysis
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4 mb-4" ref={scrollRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`rounded-lg px-4 py-2 max-w-[85%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none prose-headings:mt-2 prose-headings:mb-1 prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-lg font-bold" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-base font-bold" {...props} />,
                          h3: ({ node, ...props }) => <h3 className="text-sm font-semibold" {...props} />,
                          p: ({ node, ...props }) => <p className="text-sm leading-relaxed" {...props} />,
                          ul: ({ node, ...props }) => <ul className="text-sm space-y-0.5" {...props} />,
                          ol: ({ node, ...props }) => <ol className="text-sm space-y-0.5" {...props} />,
                          li: ({ node, ...props }) => <li className="text-sm" {...props} />,
                          strong: ({ node, ...props }) => <strong className="font-semibold text-foreground" {...props} />,
                          code: ({ node, ...props }) => <code className="bg-background/50 px-1 py-0.5 rounded text-xs" {...props} />,
                        }}
                      >
                        {message.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <p className="text-xs opacity-50 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="rounded-lg bg-muted px-4 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex gap-2">
          <Input
            placeholder="Ask about stocks, risks, entry points, or recommendations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            disabled={isLoading}
            className="flex-1"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()} size="icon">
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInput("Which stock should I buy in this category?")}
          >
            Which to buy?
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInput("What are the major risks for these stocks?")}
          >
            Risks?
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setInput("Give me entry and exit points for top 3 stocks")}
          >
            Entry/Exit points?
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
