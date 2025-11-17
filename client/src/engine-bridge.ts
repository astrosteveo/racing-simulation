/**
 * Engine Bridge - WebSocket/IPC connection to game engine
 * Handles real-time communication between 3D client and Node.js game engine
 */

// Message types from engine → client
export interface RaceStateUpdate {
  tick: number;
  raceTime: number;
  currentLap: number;
  playerCar: {
    position: number;
    lapProgress: number;
    speed: number;
    tireWear: number;
    fuelLevel: number;
  };
  cars: Array<{
    id: string;
    position: number;
    lapProgress: number;
  }>;
}

export interface DecisionPrompt {
  id: string;
  type: string;
  situation: string;
  options: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  timeLimit: number;
}

export interface RaceEvent {
  type: string;
  message: string;
  timestamp: number;
}

// Message types from client → engine
export interface PlayerDecision {
  promptId: string;
  optionId: string;
  timestamp: number;
}

export type EngineMessage = RaceStateUpdate | DecisionPrompt | RaceEvent;

export type ClientMessage = PlayerDecision;

// Event handlers
export interface EngineBridgeEvents {
  onRaceStateUpdate?: (update: RaceStateUpdate) => void;
  onDecisionPrompt?: (prompt: DecisionPrompt) => void;
  onRaceEvent?: (event: RaceEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

export class EngineBridge {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // ms
  private events: EngineBridgeEvents;
  private isConnected = false;

  constructor(private url: string, events: EngineBridgeEvents = {}) {
    this.events = events;
  }

  /**
   * Connect to the game engine
   */
  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.warn('Already connected to engine');
      return;
    }

    console.log(`Connecting to engine at ${this.url}...`);

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('✅ Connected to game engine');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.events.onConnect?.();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        const err = new Error('WebSocket connection error');
        this.events.onError?.(err);
      };

      this.ws.onclose = () => {
        console.log('Disconnected from engine');
        this.isConnected = false;
        this.events.onDisconnect?.();
        this.attemptReconnect();
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.events.onError?.(error as Error);
    }
  }

  /**
   * Disconnect from the game engine
   */
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Send a decision to the engine
   */
  sendDecision(decision: PlayerDecision): void {
    this.send('PlayerDecision', decision);
  }

  /**
   * Send a generic message to the engine
   */
  private send(type: string, data: ClientMessage): void {
    if (!this.isConnected || !this.ws) {
      console.error('Cannot send message: not connected to engine');
      return;
    }

    const message = JSON.stringify({ type, data });
    this.ws.send(message);
  }

  /**
   * Handle incoming messages from the engine
   */
  private handleMessage(rawData: string): void {
    try {
      const message = JSON.parse(rawData);

      // Validate message structure
      if (!message.type || !message.data) {
        console.error('Invalid message format:', message);
        return;
      }

      // Route to appropriate handler
      switch (message.type) {
        case 'RaceStateUpdate':
          this.events.onRaceStateUpdate?.(message.data as RaceStateUpdate);
          break;

        case 'DecisionPrompt':
          this.events.onDecisionPrompt?.(message.data as DecisionPrompt);
          break;

        case 'RaceEvent':
          this.events.onRaceEvent?.(message.data as RaceEvent);
          break;

        default:
          console.warn('Unknown message type:', message.type);
      }
    } catch (error) {
      console.error('Failed to parse message:', error);
      this.events.onError?.(error as Error);
    }
  }

  /**
   * Attempt to reconnect to the engine
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      const error = new Error('Failed to reconnect to engine');
      this.events.onError?.(error);
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * this.reconnectAttempts;

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Check if currently connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}
