const MAX_BACKOFF_MS = 30_000;

type MessageHandler = (data: string) => void;
type ErrorHandler = (err: Error) => void;
type StatusHandler = (status: 'connected' | 'reconnecting') => void;

interface WsManagerOptions {
  url: string;
  onMessage: MessageHandler;
  onError?: ErrorHandler;
  onStatus?: StatusHandler;
}

/**
 * Maintains a persistent WebSocket with exponential backoff on disconnect.
 * Call close() to stop reconnecting and permanently close.
 */
export class WsManager {
  private ws: WebSocket | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private attempt = 0;
  private stopped = false;

  private readonly url: string;
  private readonly onMessage: MessageHandler;
  private readonly onError?: ErrorHandler;
  private readonly onStatus?: StatusHandler;

  constructor({ url, onMessage, onError, onStatus }: WsManagerOptions) {
    this.url = url;
    this.onMessage = onMessage;
    this.onError = onError;
    this.onStatus = onStatus;
    this.connect();
  }

  private connect(): void {
    if (this.stopped) return;

    this.ws = new WebSocket(this.url);

    this.ws.addEventListener('open', () => {
      this.attempt = 0;
      this.onStatus?.('connected');
    });

    this.ws.addEventListener('message', (event) => {
      this.onMessage(event.data as string);
    });

    this.ws.addEventListener('error', () => {
      this.onError?.(new Error(`WebSocket error: ${this.url}`));
    });

    this.ws.addEventListener('close', () => {
      if (!this.stopped) this.scheduleReconnect();
    });
  }

  private scheduleReconnect(): void {
    if (this.stopped) return;
    const delay = Math.min(500 * 2 ** this.attempt, MAX_BACKOFF_MS);
    this.attempt++;
    this.onStatus?.('reconnecting');
    this.timer = setTimeout(() => this.connect(), delay);
  }

  close(): void {
    this.stopped = true;
    if (this.timer !== null) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.ws && this.ws.readyState !== WebSocket.CLOSED) {
      this.ws.close();
    }
    this.ws = null;
  }
}
