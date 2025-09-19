export interface MessageBus {
  connect(): Promise<void>;
  publish(topic: string, payload: any): Promise<void>;
  subscribe(topic: string, onMessage: (payload: any) => Promise<void>): Promise<void>;
  disconnect(): Promise<void>;
}
