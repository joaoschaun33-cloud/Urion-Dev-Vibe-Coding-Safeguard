import { describe, it, expect, vi } from 'vitest';
import { DomainEventBus, type DomainEvent } from './domain-event-bus';

const makeEvent = (eventName: string): DomainEvent => ({
  eventName,
  occurredOn: new Date('2026-01-01T00:00:00Z'),
  payload: { id: 1 },
});

describe('DomainEventBus', () => {
  it('entrega o evento a todos os handlers inscritos, na ordem', async () => {
    const bus = new DomainEventBus();
    const calls: string[] = [];
    bus.subscribe('user.created', () => {
      calls.push('a');
    });
    bus.subscribe('user.created', () =>
      Promise.resolve().then(() => {
        calls.push('b');
      })
    );

    await bus.publish(makeEvent('user.created'));

    expect(calls).toEqual(['a', 'b']);
  });

  it('nao chama handlers de outro evento', async () => {
    const bus = new DomainEventBus();
    const other = vi.fn();
    bus.subscribe('other', other);

    await bus.publish(makeEvent('user.created'));

    expect(other).not.toHaveBeenCalled();
  });

  it('publicar sem handlers nao lanca erro', async () => {
    const bus = new DomainEventBus();
    await expect(bus.publish(makeEvent('nobody'))).resolves.toBeUndefined();
  });

  it('propaga o erro de um handler que falha', async () => {
    const bus = new DomainEventBus();
    bus.subscribe('boom', () => {
      throw new Error('handler falhou');
    });

    await expect(bus.publish(makeEvent('boom'))).rejects.toThrow('handler falhou');
  });
});
