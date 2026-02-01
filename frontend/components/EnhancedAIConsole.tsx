'use client'

import { useState, useEffect } from 'react'
import { api, COMPANY_ID } from '@/lib/api'

type AIMode = 'local' | 'research'

interface Message {
  role: 'user' | 'assistant'
  content: string
  citations?: string[]
  timestamp: Date
}

export default function EnhancedAIConsole() {
  const [mode, setMode] = useState<AIMode>('local')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [researchCapabilities, setResearchCapabilities] = useState<any>(null)

  useEffect(() => {
    // Load research capabilities
    const loadCapabilities = async () => {
      try {
        const caps = await api.get('/ai/research/capabilities')
        setResearchCapabilities(caps)
      } catch (error) {
        console.error('Failed to load capabilities:', error)
      }
    }
    loadCapabilities()
  }, [])

  const sendMessage = async (message: string, quickAction?: string) => {
    if (!message.trim() && !quickAction) return

    const userMessage = message || quickAction || ''
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }])

    setInput('')
    setLoading(true)

    try {
      let response: any

      if (mode === 'local') {
        // OpenAI - Local financial analysis
        response = await api.post('/ai/query', {
          question: userMessage
        })

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: response.answer || response.response || 'No response',
          timestamp: new Date()
        }])

      } else {
        // Perplexity - Market research
        if (quickAction === 'benchmarks') {
          response = await api.post('/ai/research/industry-benchmarks')
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.benchmarks,
            citations: response.citations,
            timestamp: new Date()
          }])
        } else if (quickAction === 'competitors') {
          response = await api.post('/ai/research/competitor-analysis')
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.analysis,
            citations: response.citations,
            timestamp: new Date()
          }])
        } else if (quickAction === 'tax') {
          response = await api.post('/ai/research/tax-updates')
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.updates,
            citations: response.citations,
            timestamp: new Date()
          }])
        } else if (quickAction === 'growth') {
          response = await api.post('/ai/research/growth-recommendations')
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: response.recommendations,
            citations: response.citations,
            timestamp: new Date()
          }])
        } else {
          // Generic query - default to benchmarks
          setMessages(prev => [...prev, {
            role: 'assistant',
            content: 'Please use one of the quick action buttons for market research, or switch to Local mode for questions about your financial data.',
            timestamp: new Date()
          }])
        }
      }
    } catch (error: any) {
      console.error('AI query failed:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error.response?.data?.detail || error.message || 'Failed to get response'}`,
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const LOCAL_PROMPTS = [
    { icon: '💰', label: 'Top Expenses', prompt: 'What are my top 5 expenses this month?' },
    { icon: '📊', label: 'Cash Flow', prompt: 'How is my cash flow looking?' },
    { icon: '📈', label: 'Revenue Trends', prompt: 'What are my revenue trends?' },
    { icon: '⚠️', label: 'Anomalies', prompt: 'Are there any unusual transactions I should know about?' },
    { icon: '💡', label: 'Cost Savings', prompt: 'Where can I cut costs?' },
    { icon: '🎯', label: 'Goals', prompt: 'Am I on track to meet my financial goals?' }
  ]

  const RESEARCH_PROMPTS = [
    {
      icon: '📊',
      label: 'Industry Benchmarks',
      action: 'benchmarks',
      description: 'Compare your metrics to industry averages',
      available: researchCapabilities?.capabilities?.industry_benchmarks?.available
    },
    {
      icon: '🎯',
      label: 'Competitor Analysis',
      action: 'competitors',
      description: 'Analyze your competitive landscape',
      available: researchCapabilities?.capabilities?.competitor_analysis?.available
    },
    {
      icon: '📋',
      label: 'Tax Updates',
      action: 'tax',
      description: 'Latest tax compliance requirements',
      available: researchCapabilities?.capabilities?.tax_updates?.available
    },
    {
      icon: '🚀',
      label: 'Growth Strategies',
      action: 'growth',
      description: 'Personalized growth recommendations',
      available: researchCapabilities?.capabilities?.growth_recommendations?.available
    }
  ]

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-2xl font-bold mb-4">AI Financial Companion</h2>

        {/* Mode Toggle */}
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setMode('local')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'local'
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Local Analysis
          </button>
          <button
            onClick={() => setMode('research')}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'research'
                ? 'bg-green-600 text-white'
                : 'text-gray-700 hover:bg-gray-200'
            }`}
          >
            🌐 Market Intelligence
          </button>
        </div>

        <p className="text-sm text-gray-600 mt-2">
          {mode === 'local'
            ? 'Ask questions about your financial data, transactions, and trends'
            : 'Get real-time market insights, benchmarks, and competitor analysis'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-b bg-gray-50">
        <h3 className="text-sm font-semibold mb-2 text-gray-700">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {mode === 'local' ? (
            LOCAL_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt.prompt)}
                className="p-3 bg-white border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors text-left"
                disabled={loading}
              >
                <div className="text-2xl mb-1">{prompt.icon}</div>
                <div className="text-xs font-medium">{prompt.label}</div>
              </button>
            ))
          ) : (
            RESEARCH_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => prompt.available && sendMessage('', prompt.action)}
                className={`p-3 border rounded-lg text-left transition-colors ${
                  prompt.available
                    ? 'bg-white hover:bg-green-50 hover:border-green-300'
                    : 'bg-gray-100 border-gray-200 opacity-50 cursor-not-allowed'
                }`}
                disabled={loading || !prompt.available}
                title={prompt.available ? prompt.description : 'Complete your profile to unlock'}
              >
                <div className="text-2xl mb-1">{prompt.icon}</div>
                <div className="text-xs font-medium">{prompt.label}</div>
                {!prompt.available && (
                  <div className="text-xs text-red-500 mt-1">⚠ Profile needed</div>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-12">
            <div className="text-6xl mb-4">🤖</div>
            <p className="text-lg">
              {mode === 'local'
                ? 'Ask me anything about your finances!'
                : 'Get real-time market intelligence!'}
            </p>
            <p className="text-sm mt-2">
              {mode === 'local'
                ? 'Use the quick actions above or type your own question'
                : 'Click a quick action to get started'}
            </p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-lg ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-300">
                    <div className="text-xs font-semibold mb-2">Sources:</div>
                    <div className="space-y-1">
                      {msg.citations.map((citation, idx) => (
                        <div key={idx} className="text-xs">
                          <a
                            href={citation}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            [{idx + 1}] {citation}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-xs opacity-70 mt-2">
                  {msg.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <span className="text-sm text-gray-600">Thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            sendMessage(input)
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === 'local'
                ? 'Ask about your finances...'
                : 'Use quick actions for research...'
            }
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}
