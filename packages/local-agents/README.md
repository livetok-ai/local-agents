# @livetok-ai/local-agents

A TypeScript library that provides real-time speech recognition and synthesis capabilities for web applications, with local AI processing support.

## Features

- 🎤 **Real-time Speech Recognition**: Uses browser's Web Speech API for continuous speech recognition
- 🔊 **Text-to-Speech**: Built-in speech synthesis with customizable voices
- 🤖 **Local AI Integration**: Supports local language models for privacy-focused conversations
- ⚡ **Event-driven API**: Simple event-based architecture for easy integration
- 🎯 **Turn Detection**: Automatic conversation turn detection with configurable silence thresholds
- 🎨 **Customizable**: Configurable instructions, voice selection, and logging

## Installation

```bash
npm install @livetok-ai/local-agents
```

## Quick Start

```typescript
import { LocalRealTimeAgent } from '@livetok-ai/local-agents';

// Create an agent instance
const agent = new LocalRealTimeAgent({
  instructions: 'You are a helpful assistant.',
  voiceName: 'Google UK English Female',
  turnSilenceThreshold: 1500,
  logger: console.log
});

// Listen for events
agent.on('user', (text: string) => {
  console.log('User said:', text);
});

agent.on('assistant', (text: string) => {
  console.log('Assistant replied:', text);
});

agent.on('speaking', (isSpeaking: boolean) => {
  console.log('Agent speaking:', isSpeaking);
});

// Start the agent
await agent.start();

// Stop the agent
await agent.stop();
```

## API Reference

### LocalRealTimeAgent

#### Constructor Options

```typescript
interface AgentOptions {
  instructions?: string;           // System prompt for the AI
  turnSilenceThreshold?: number;   // Milliseconds to wait before processing turn
  voiceName?: string;              // Name of the voice to use for speech synthesis
  logger?: (message: string, ...args: any[]) => void; // Custom logger function
}
```

#### Methods

- `start()`: Start speech recognition
- `stop()`: Stop speech recognition and synthesis
- `speak(text: string)`: Speak the given text
- `static available()`: Check if the agent is available in the current environment

#### Events

- `user`: Emitted when user speech is recognized
- `assistant`: Emitted when AI generates a response
- `speaking`: Emitted when speech synthesis starts/stops
- `start`: Emitted when recognition starts
- `stop`: Emitted when recognition stops
- `error`: Emitted when an error occurs

### Availability Check

```typescript
const status = await LocalRealTimeAgent.available();
// Returns: 'available' | 'unavailable' | 'downloading'
```

## Browser Requirements

- **Speech Recognition**: `SpeechRecognition` or `webkitSpeechRecognition` API
- **Speech Synthesis**: `speechSynthesis` API
- **Language Model**: Browser-compatible language model (e.g., WebLLM)

## Examples

### Basic Chat Interface

```typescript
import { LocalRealTimeAgent } from '@livetok-ai/local-agents';

const agent = new LocalRealTimeAgent({
  instructions: 'You are a helpful voice assistant.',
  voiceName: 'Microsoft David - English (United States)'
});

agent.on('user', (text) => {
  // Display user message in UI
  addMessage('user', text);
});

agent.on('assistant', (text) => {
  // Display assistant response in UI
  addMessage('assistant', text);
});

// Start button handler
document.getElementById('startBtn').onclick = () => agent.start();
document.getElementById('stopBtn').onclick = () => agent.stop();
```

### Custom Voice Selection

```typescript
// Get available voices
const voices = speechSynthesis.getVoices();
console.log('Available voices:', voices.map(v => v.name));

// Use a specific voice
const agent = new LocalRealTimeAgent({
  voiceName: 'Google UK English Female'
});
```

### Error Handling

```typescript
agent.on('error', (error) => {
  console.error('Agent error:', error);
  // Handle error appropriately
  showErrorMessage(error.message);
});
```

## Development

### Building

```bash
pnpm build
```

### Testing

The package includes a test app in the monorepo that demonstrates all features.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 