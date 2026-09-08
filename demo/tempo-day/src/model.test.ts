import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, parseSavedState, pauseSession, remainingSeconds, startSession } from './model.ts';

test('timer uses an absolute deadline after background elapsed time', () => {
  const state = startSession(createInitialState(), 'sample-0', 1000);
  assert.equal(remainingSeconds(state.tasks[0], state.session, 61_000), 1440);
  assert.equal(remainingSeconds(state.tasks[0], state.session, 2_000_000), 0);
});

test('pause and resume retain remaining time', () => {
  const state = pauseSession(startSession(createInitialState(), 'sample-0', 1000), 11_000);
  assert.equal(state.tasks[0].remaining, 1490);
  const resumed = startSession(state, 'sample-0', 31_000);
  assert.equal(resumed.session?.endAt, 1_521_000);
});

test('switching tasks pauses the first task', () => {
  const state = startSession(startSession(createInitialState(), 'sample-0', 1000), 'sample-1', 21_000);
  assert.equal(state.tasks[0].remaining, 1480);
  assert.equal(state.session?.taskId, 'sample-1');
});

test('saved states roundtrip and invalid persisted values are rejected', () => {
  const state = startSession(createInitialState(), 'sample-0', 1000);
  assert.deepEqual(parseSavedState(JSON.stringify(state)), state);
  assert.equal(parseSavedState('{bad'), null);
  assert.equal(parseSavedState(JSON.stringify({ ...state, tasks: [{ ...state.tasks[0], minutes: -1 }] })), null);
});
