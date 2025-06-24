import { useRef, useState, useEffect } from 'react'
import { LocalRealTimeAgent } from '@livetok/local-agents'
import './App.css'

interface ChatMessage {
  text: string
  type: 'user' | 'assistant'
}

function App() {
  const [running, setRunning] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [speaking, setSpeaking] = useState(false)
  const [availability, setAvailability] = useState<'available' | 'unavailable' | 'downloading' | 'checking'>('checking')
  const [selectedVoice, setSelectedVoice] = useState('Albert')
  const agentRef = useRef<LocalRealTimeAgent | null>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const voiceSelectRef = useRef<HTMLSelectElement>(null)

  const populateVoiceList = () => {
    if (typeof speechSynthesis === "undefined") {
      return;
    }

    const voices = speechSynthesis.getVoices();
    const voiceSelect = voiceSelectRef.current;

    if (!voiceSelect) return;

    // Clear existing options
    voiceSelect.innerHTML = '';
    console.log('voices', voices);

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
    // Check availability on mount
    const checkAvailability = async () => {
      const status = await LocalRealTimeAgent.available()
      setAvailability(status)
    }
    checkAvailability()
  }, [])

  useEffect(() => {
    // Populate voice list on mount
    populateVoiceList();
    
    if (
      typeof speechSynthesis !== "undefined" &&
      speechSynthesis.onvoiceschanged !== undefined
    ) {
      speechSynthesis.onvoiceschanged = populateVoiceList;
    }
  }, [])

  useEffect(() => {
    // Scroll to bottom when messages change
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handleClick = async () => {
    if (!agentRef.current) {
      agentRef.current = new LocalRealTimeAgent({
        voiceName: selectedVoice,
        logger: console.log
      })
      agentRef.current.on('user', (text: string) => {
        setMessages(prev => [...prev, { text, type: 'user' }])
      })
      agentRef.current.on('assistant', (text: string) => {
        setMessages(prev => [...prev, { text, type: 'assistant' }])
      })
      agentRef.current.on('speaking', (isSpeaking: boolean) => {
        setSpeaking(isSpeaking)
      })
      agentRef.current.on('error', (_error: Error) => {
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

  const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedVoice(event.target.value)
  }

  return (
    <div className="app-container">
      <div className="availability-status">
        Status: {availability}
      </div>
      <div className="voice-selection">
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
      <div ref={chatContainerRef} className="chat-container">
        {messages.map((msg, index) => {
          const isLatestAssistant = msg.type === 'assistant' && index === messages.length - 1
          return (
            <div 
              key={index} 
              className={`chat-message ${msg.type} ${isLatestAssistant && speaking ? 'speaking' : ''}`}
            >
              <span className="message-type">{msg.type === 'user' ? 'You' : 'Assistant'}:</span>
              {msg.text}
            </div>
          )
        })}
      </div>
      <button 
        onClick={handleClick} 
        className={`control-button ${running ? 'running' : 'stopped'}`}
        disabled={availability !== 'available'}
      >
        {running ? 'Stop' : 'Start'}
      </button>
    </div>
  )
}

export default App
