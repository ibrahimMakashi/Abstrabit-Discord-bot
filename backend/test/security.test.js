import test from 'node:test';
import assert from 'node:assert/strict';
import { buildDiscordReply, ensureInteractionFresh, getStatusResponseText } from '../src/services/discordService.js';
import { calculateRetryDelay } from '../src/utils/retry.js';

test('ensureInteractionFresh accepts recent timestamps', () => {
  const timestamp = String(Math.floor(Date.now() / 1000));
  assert.doesNotThrow(() => ensureInteractionFresh(timestamp));
});

test('ensureInteractionFresh rejects stale timestamps', () => {
  const timestamp = String(Math.floor((Date.now() - 10 * 60 * 1000) / 1000));
  assert.throws(() => ensureInteractionFresh(timestamp), /Replay attack detected/);
});

test('buildDiscordReply creates Discord-compatible message payload', () => {
  assert.deepEqual(buildDiscordReply('Hello world'), {
    type: 4,
    data: {
      content: 'Hello world',
    },
  });
});

test('calculateRetryDelay backs off exponentially with cap', () => {
  assert.equal(calculateRetryDelay(1), 30_000);
  assert.equal(calculateRetryDelay(2), 60_000);
  assert.equal(calculateRetryDelay(10), 1_800_000);
});

test('getStatusResponseText includes core status lines', () => {
  const message = getStatusResponseText();
  assert.match(message, /Bot Online: Yes/);
  assert.match(message, /Database Connected:/);
  assert.match(message, /Server Running: Yes/);
});
