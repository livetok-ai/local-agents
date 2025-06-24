/// <reference path="./global.d.ts" />
import EventEmitter from 'eventemitter3';

export interface AgentOptions {
  instructions?: string;
  turnSilenceThreshold?: number;
  voiceName?: string;
  logger?: (message: string, ...args: any[]) => void;
}

export type AgentEvent = 'user' | 'assistant' | 'start' | 'stop' | 'error';

export type EventCallback = (payload: string | Error) => void;

export class LocalRealTimeAgent extends EventEmitter {
  private pendingTranscript: string = '';
  private recognition: SpeechRecognition | null = null;
  private languageModelSession: LanguageModel | null = null;
  private turnDetectionTimeout: ReturnType<typeof setTimeout> | null = null;
  private speakingPollInterval: ReturnType<typeof setInterval> | null = null;
  private isCurrentlySpeaking: boolean = false;
  private readonly options: AgentOptions;

  constructor(options: AgentOptions = {}) {
    super();
    this.options = options;
    this.setupLanguageModel();
  }

  private async setupLanguageModel(): Promise<void> {
    this.languageModelSession = await window.LanguageModel.create({
      initialPrompts: [
        {
          role: 'system',
          content: this.options.instructions || 'You are a helpful and friendly voice assistant. Reply with short answers without formatting and provide helpful information.  Don\'t reply with content that is not related to the question and ask for clarifications if the question is not clear.'
        }
      ]
    });
  }

  static async available(): Promise<'available' | 'unavailable' | 'downloading'> {
    if (typeof window === 'undefined') return 'unavailable';
    const hasRecognition = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
    const hasSynthesis = 'speechSynthesis' in window;
    const hasLanguageModel = 'LanguageModel' in window && typeof (window as any).LanguageModel?.availability === 'function';
    
    if (!hasRecognition || !hasSynthesis || !hasLanguageModel) {
      return 'unavailable';
    }
    
    const languageModelStatus = await (window as any).LanguageModel.availability();
    
    if (languageModelStatus === 'downloadable') {
      // Trigger download by calling create
      try {
        await (window as any).LanguageModel.create({
          initialPrompts: [
            {
              role: 'system',
              content: 'You are a helpful and friendly voice assistant.'
            }
          ]
        });
      } catch (error) {
        // Ignore errors during download trigger
      }
      return 'downloading';
    }
    
    return languageModelStatus;
  }

  private startRecognition(): void {
    const recognition = new ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // Interruption detected
      this.options.logger?.('interruption detected');
      window.speechSynthesis.cancel();
      if (this.turnDetectionTimeout) {
        clearTimeout(this.turnDetectionTimeout);
      }
      const lastResult = event.results[event.results.length - 1];
      const transcript = lastResult[0].transcript.trim();
      if (lastResult.isFinal && transcript) {
        this.options.logger?.('stt detected:', transcript.substring(0, 40));
        this.pendingTranscript += transcript;
        this.emit('user', transcript);
        this.turnDetectionTimeout = setTimeout(() => {
          if (this.pendingTranscript) {
            this.processTurn(this.pendingTranscript);
            this.pendingTranscript = '';
          }
        }, this.options.turnSilenceThreshold || 1000);
      }
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      this.options.logger?.('speech recognition error:', event.error);
      this.emit('error', new Error(event.error));
    };
    recognition.onend = (event: SpeechRecognitionEvent) => {
      this.options.logger?.('speech recognition ended', event);
      
      if (this.recognition) {
        // restart it
        this.startRecognition();
      }
    };
    recognition.start();
    this.recognition = recognition;
  }

  start(): void {
    try {
      this.startRecognition();
      this.startSpeakingPoll();
      this.emit('start');
    } catch (error) {
      this.options.logger?.('error starting agent:', error);
      this.stop();
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
    }
  }

  stop(): void {
    this.options.logger?.('stopping agent');
    if (this.turnDetectionTimeout) {
      clearTimeout(this.turnDetectionTimeout);
    }
    if (this.speakingPollInterval) {
      clearInterval(this.speakingPollInterval);
      this.speakingPollInterval = null;
    }
    try {
      window.speechSynthesis.cancel();
      if (this.recognition) {
        this.recognition.stop();
        this.recognition = null;
      }
      this.emit('stop');
    } catch (error) {
      this.options.logger?.('error stopping speech recognition:', error);
      this.emit('error', error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private async processTurn(content: string): Promise<void> {
    if (this.languageModelSession) {
      const response = await this.languageModelSession.prompt(content);
      this.options.logger?.('llm response:', response);
      
      this.emit('assistant', response);
      this.speak(response);
    }
  }

  async speak(text: string): Promise<void> {
    this.options.logger?.('tts speak: ', text.substring(0, 40));
    const utterance = new SpeechSynthesisUtterance(text);
    if (this.options.voiceName) {
      const voices = window.speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => voice.name === this.options.voiceName);
      if (selectedVoice) {
        this.options.logger?.('tts voice: ', selectedVoice.name);
        utterance.voice = selectedVoice;
      } else {
        this.options.logger?.(`voice "${this.options.voiceName}" not found. using default voice.`);
      }
    }
    
    window.speechSynthesis.speak(utterance);
  }

  private startSpeakingPoll(): void {
    this.speakingPollInterval = setInterval(() => {
      const currentlySpeaking = window.speechSynthesis.speaking;
      if (currentlySpeaking !== this.isCurrentlySpeaking) {
        this.options.logger?.('tts speaking: ', currentlySpeaking);
        this.isCurrentlySpeaking = currentlySpeaking;
        this.emit('speaking', currentlySpeaking);
      }
    }, 500);
  }
}