"use client"

import * as React from 'react'
import { useRef, useState, useEffect } from 'react'
import { LocalRealTimeAgent } from '@livetok/local-agents'

interface ChatMessage {
  text: string
  type: 'user' | 'assistant'
}

export default function DemoPage(): JSX.Element {
  const [running, setRunning] = useState<boolean>(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [speaking, setSpeaking] = useState<boolean>(false)
  const [availability, setAvailability] = useState<'available' | 'unavailable' | 'downloading' | 'checking'>('checking')
  const [selectedVoice, setSelectedVoice] = useState<string>('Albert')
  const agentRef = useRef<LocalRealTimeAgent | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const voiceSelectRef = useRef<HTMLSelectElement>(null)

  const populateVoiceList = (): void => {
    if (typeof speechSynthesis === "undefined") {
      return;
    }
    const voices = speechSynthesis.getVoices();
    const voiceSelect = voiceSelectRef.current;
    if (!voiceSelect) return;
    voiceSelect.innerHTML = '';
    for (const voice of voices) {
      const option = document.createElement("option");
      option.textContent = `${voice.name} (${voice.lang})`;
      if (voice.default) {
        option.textContent += " — DEFAULT";
      }
      option.setAttribute("data-lang", voice.lang);
      option.setAttribute("data-name", voice.name);
      option.value = voice.name;
      voiceSelect.appendChild(option);
    }
  };

  useEffect(() => {
    const checkAvailability = async (): Promise<void> => {
      const status = await LocalRealTimeAgent.available()
      setAvailability(status)
    }
    checkAvailability()
  }, [])

  useEffect(() => {
    populateVoiceList();
    if (
      typeof speechSynthesis !== "undefined" &&
      speechSynthesis.onvoiceschanged !== undefined
    ) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleClick = async (): Promise<void> => {
    if (!agentRef.current) {
      agentRef.current = new LocalRealTimeAgent({
        voiceName: selectedVoice,
        logger: console.log
      })
      agentRef.current.on('user', (text: string) => {
        setMessages((prev: ChatMessage[]) => [...prev, { text, type: 'user' }])
      })
      agentRef.current.on('assistant', (text: string) => {
        setMessages((prev: ChatMessage[]) => [...prev, { text, type: 'assistant' }])
      })
      agentRef.current.on('speaking', (isSpeaking: boolean) => {
        setSpeaking(isSpeaking)
      })
      agentRef.current.on('error', (_error: Error) => {
        agentRef.current = null
        setRunning(false)
      })
      agentRef.current.on('stop', () => {
        agentRef.current = null
        setRunning(false)
      })
    }
    if (running) {
      await agentRef.current.stop()
      setRunning(false)
    } else {
      await agentRef.current.start()
      setRunning(true)
    }
  }

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedVoice(event.target.value)
  }

  return (
    <div className="app-container" style={{ maxWidth: 480, margin: '40px auto', fontFamily: 'sans-serif' }}>
      <div className="availability-status" style={{ marginBottom: 16 }}>
        Status: {availability}
      </div>
      <div className="voice-selection" style={{ marginBottom: 16 }}>
        <label htmlFor="voiceSelect">Voice: </label>
        <select 
          id="voiceSelect" 
          ref={voiceSelectRef}
          value={selectedVoice}
          onChange={handleVoiceChange}
          disabled={running}
        >
          <option value="Albert">Albert</option>
        </select>
      </div>
      <div ref={chatContainerRef} className="chat-container" style={{ minHeight: 200, maxHeight: 300, overflowY: 'auto', border: '1px solid #ccc', borderRadius: 8, padding: 16, marginBottom: 16 }}>
        {messages.map((msg, index) => {
          const isLatestAssistant = msg.type === 'assistant' && index === messages.length - 1
          return (
            <div 
              key={index} 
              className={`chat-message ${msg.type} ${isLatestAssistant && speaking ? 'speaking' : ''}`}
              style={{ marginBottom: 8, color: msg.type === 'user' ? '#333' : '#0070f3', fontWeight: isLatestAssistant && speaking ? 'bold' : 'normal' }}
            >
              <span className="message-type" style={{ marginRight: 8 }}>{msg.type === 'user' ? 'You' : 'Assistant'}:</span>
              {msg.text}
            </div>
          )
        })}
      </div>
      <button 
        onClick={handleClick} 
        className={`control-button ${running ? 'running' : 'stopped'}`}
        disabled={availability !== 'available'}
        style={{ padding: '10px 24px', fontSize: 16, borderRadius: 6, background: running ? '#e00' : '#0070f3', color: '#fff', border: 'none', cursor: availability === 'available' ? 'pointer' : 'not-allowed' }}
      >
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}
