/**
 * Tests for Engine Bridge
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EngineBridge } from './engine-bridge';

// Mock WebSocket
class MockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;

  readyState = MockWebSocket.CLOSED;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: ((error: Event) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(public url: string) {
    // Simulate async connection
    setTimeout(() => {
      this.readyState = MockWebSocket.OPEN;
      this.onopen?.();
    }, 10);
  }

  send(_data: string): void {
    // Mock send - data intentionally unused
  }

  close(): void {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }
}

// Install mock
global.WebSocket = MockWebSocket as any;

describe('EngineBridge', () => {
  let bridge: EngineBridge;

  beforeEach(() => {
    bridge = new EngineBridge('ws://localhost:8080');
  });

  it('creates bridge instance', () => {
    expect(bridge).toBeDefined();
    expect(bridge.connected).toBe(false);
  });

  it('connects to engine', async () => {
    const onConnect = vi.fn();
    bridge = new EngineBridge('ws://localhost:8080', { onConnect });

    bridge.connect();

    // Wait for async connection
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(onConnect).toHaveBeenCalled();
    expect(bridge.connected).toBe(true);
  });

  it('handles RaceStateUpdate messages', async () => {
    const onRaceStateUpdate = vi.fn();
    bridge = new EngineBridge('ws://localhost:8080', { onRaceStateUpdate });

    bridge.connect();
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Simulate receiving a message
    const message = {
      type: 'RaceStateUpdate',
      data: {
        tick: 100,
        raceTime: 10.5,
        currentLap: 5,
        playerCar: {
          position: 8,
          lapProgress: 0.45,
          speed: 142,
          tireWear: 75,
          fuelLevel: 60,
        },
        cars: [],
      },
    };

    const ws = (bridge as any).ws as MockWebSocket;
    ws.onmessage?.({ data: JSON.stringify(message) });

    expect(onRaceStateUpdate).toHaveBeenCalledWith(message.data);
  });

  it('handles DecisionPrompt messages', async () => {
    const onDecisionPrompt = vi.fn();
    bridge = new EngineBridge('ws://localhost:8080', { onDecisionPrompt });

    bridge.connect();
    await new Promise((resolve) => setTimeout(resolve, 20));

    const message = {
      type: 'DecisionPrompt',
      data: {
        id: 'prompt-1',
        type: 'passing',
        situation: 'You have a run on #42!',
        options: [
          { id: 'opt-1', label: 'Go inside', description: 'Aggressive move' },
          { id: 'opt-2', label: 'Wait', description: 'Patient approach' },
        ],
        timeLimit: 10,
      },
    };

    const ws = (bridge as any).ws as MockWebSocket;
    ws.onmessage?.({ data: JSON.stringify(message) });

    expect(onDecisionPrompt).toHaveBeenCalledWith(message.data);
  });

  it('sends PlayerDecision messages', async () => {
    bridge.connect();
    await new Promise((resolve) => setTimeout(resolve, 20));

    const ws = (bridge as any).ws as MockWebSocket;
    const sendSpy = vi.spyOn(ws, 'send');

    bridge.sendDecision({
      promptId: 'prompt-1',
      optionId: 'opt-1',
      timestamp: Date.now(),
    });

    expect(sendSpy).toHaveBeenCalled();
    const sentData = JSON.parse(sendSpy.mock.calls[0][0]);
    expect(sentData.type).toBe('PlayerDecision');
    expect(sentData.data.promptId).toBe('prompt-1');
  });

  it('handles disconnect', async () => {
    const onDisconnect = vi.fn();
    bridge = new EngineBridge('ws://localhost:8080', { onDisconnect });

    bridge.connect();
    await new Promise((resolve) => setTimeout(resolve, 20));

    bridge.disconnect();

    expect(onDisconnect).toHaveBeenCalled();
    expect(bridge.connected).toBe(false);
  });

  it('validates message format', async () => {
    const onError = vi.fn();
    const onRaceStateUpdate = vi.fn();
    bridge = new EngineBridge('ws://localhost:8080', { onError, onRaceStateUpdate });

    bridge.connect();
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Send invalid message (no type field)
    const ws = (bridge as any).ws as MockWebSocket;
    ws.onmessage?.({ data: JSON.stringify({ data: {} }) });

    // Should not call update handler with invalid message
    expect(onRaceStateUpdate).not.toHaveBeenCalled();
  });
});
