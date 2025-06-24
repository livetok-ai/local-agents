// Web Speech API types
declare global {
  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onend: ((event: SpeechRecognitionEvent) => void) | null;
    start(): void;
    stop(): void;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechSynthesis {
    speak(utterance: SpeechSynthesisUtterance): void;
    cancel(): void;
    pause(): void;
    resume(): void;
    readonly paused: boolean;
    readonly speaking: boolean;
    readonly pending: boolean;
  }

  declare class SpeechSynthesisUtterance {
    constructor(text?: string);
    text: string;
    lang: string;
    voice: SpeechSynthesisVoice | null;
    volume: number;
    rate: number;
    pitch: number;
  }

  interface SpeechSynthesisVoice {
    readonly voiceURI: string;
    readonly name: string;
    readonly lang: string;
    readonly localService: boolean;
    readonly default: boolean;
  }

  // LanguageModel types based on Chrome Extensions AI Prompt API
  interface LanguageModelParams {
    defaultTemperature: number;
    maxTemperature: number;
    defaultTopK: number;
    maxTopK: number;
  }

  interface LanguageModelAvailability {
    unavailable: 'unavailable';
    available: 'available';
    downloading: 'downloading';
  }

  interface PromptMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }

  interface LanguageModelOptions {
    initialPrompts?: PromptMessage[];
    signal?: AbortSignal;
  }

  interface LanguageModel {
    prompt(prompt: string, options?: { signal?: AbortSignal }): Promise<string>;
    promptStreaming(prompt: string, options?: { signal?: AbortSignal }): ReadableStream<string>;
    clone(options?: { signal?: AbortSignal }): Promise<LanguageModel>;
    destroy(): void;
    inputUsage: number;
    inputQuota: number;
  }

  interface LanguageModelStatic {
    create(options?: LanguageModelOptions): Promise<LanguageModel>;
    params(): Promise<LanguageModelParams>;
    availability(): Promise<LanguageModelAvailability[keyof LanguageModelAvailability]>;
  }

  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
    readonly speechSynthesis: SpeechSynthesis;
    LanguageModel: LanguageModelStatic;
  }
}

export {};
