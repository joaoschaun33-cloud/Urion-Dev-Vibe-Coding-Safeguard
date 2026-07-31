export interface DomainEvent {
  eventName: string;
  occurredOn: Date;
  payload: Record<string, unknown>;
}

type EventHandler = (event: DomainEvent) => Promise<void> | void;

export class DomainEventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventName: string, handler: EventHandler): void {
    const existing = this.handlers.get(eventName) ?? [];
    this.handlers.set(eventName, [...existing, handler]);
  }

  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventName) ?? [];
    for (const handler of handlers) {
      await handler(event);
    }
  }
}

export const domainEventBus = new DomainEventBus();
