# Local Agents

A TypeScript library that provides real-time speech recognition and synthesis capabilities for web applications, with local AI processing support.

## 🚀 Features

- 🎤 **Real-time Speech Recognition**: Uses browser's Web Speech API for continuous speech recognition
- 🔊 **Text-to-Speech**: Built-in speech synthesis with customizable voices
- 🤖 **Local AI Integration**: Supports local language models for privacy-focused conversations
- ⚡ **Event-driven API**: Simple event-based architecture for easy integration
- 🎯 **Turn Detection**: Automatic conversation turn detection with configurable silence thresholds
- 🎨 **Customizable**: Configurable instructions, voice selection, and logging

## 📦 Project Structure

```
local-agents/
├── packages/
│   ├── local-agents/     # Main library package
│   └── demo/         # React demo application
├── package.json          # Root package configuration
└── README.md            # This file
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd local-agents

# Install dependencies
pnpm install
```

### Running the Test App

The test app is a React application that demonstrates all the features of the local-agents library.

```bash
# Start the development server
pnpm --filter @livetok/demo dev

# Or navigate to the demo directory and run
cd packages/demo
pnpm dev
```

The test app will be available at `http://localhost:5173` (or the port shown in the terminal).

### Building

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @livetok/local-agents build
pnpm --filter @livetok/demo build
```

### Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch
```

## 📚 Usage

### Basic Example

```typescript
import { LocalRealTimeAgent } from '@livetok/local-agents';

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

### API Reference

#### LocalRealTimeAgent Constructor Options

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

## 🌐 Browser Requirements

- **Speech Recognition**: `SpeechRecognition` or `webkitSpeechRecognition` API
- **Speech Synthesis**: `speechSynthesis` API
- **Language Model**: Browser-compatible language model (e.g., WebLLM)

## 🧪 Testing the Library

The test app provides a complete demonstration of the library's capabilities:

1. **Start the test app**: `pnpm --filter @livetok/demo dev`
2. **Open your browser** to the provided URL
3. **Grant microphone permissions** when prompted
4. **Click "Start"** to begin speech recognition
5. **Speak naturally** and watch the conversation flow

The test app includes:
- Real-time speech recognition display
- Voice selection options
- Turn detection visualization
- Error handling and status indicators

## 📖 Documentation

For detailed API documentation and advanced usage examples, see the [local-agents package README](./packages/local-agents/README.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details. 