import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { createApiServer } from '../src/server';
import type { AddressInfo } from 'node:net';

let tempDir = '';
let server: ReturnType<typeof createApiServer>;
let baseUrl = '';

async function request(path: string, init: RequestInit = {}) {
  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      'content-type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

beforeEach(async () => {
  tempDir = await mkdtemp(join(tmpdir(), 'hcd-api-'));
  process.env.API_DB_PATH = join(tempDir, 'saves.json');
  server = createApiServer();
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  baseUrl = `http://127.0.0.1:${address.port}`;
});

afterEach(async () => {
  await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  await rm(tempDir, { recursive: true, force: true });
  delete process.env.API_DB_PATH;
});

describe('mutation sequencing + idempotent retries', () => {
  it('replays a retry with same operation id without reapplying mutation', async () => {
    const create = await request('/api/v1/saves/snapshots', {
      method: 'POST',
      headers: {
        'x-operation-id': 'op-create-1',
        'x-sequence-number': '1',
      },
      body: JSON.stringify({ saveId: 'save-1', state: { season: 1 } }),
    });
    assert.equal(create.status, 201);

    const updateBody = JSON.stringify({ state: { season: 2 } });
    const firstAttempt = await request('/api/v1/saves/save-1/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-update-2',
        'x-sequence-number': '2',
      },
      body: updateBody,
    });
    assert.equal(firstAttempt.status, 200);

    const retry = await request('/api/v1/saves/save-1/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-update-2',
        'x-sequence-number': '2',
      },
      body: updateBody,
    });

    assert.equal(retry.status, 200);
    assert.equal(retry.headers.get('x-idempotent-replay'), 'true');

    const snapshot = await request('/api/v1/saves/save-1/snapshot');
    const data = (await snapshot.json()) as { state: { season: number } };
    assert.equal(data.state.season, 2);
  });

  it('rejects out-of-order delivery until missing sequence is applied', async () => {
    await request('/api/v1/saves/snapshots', {
      method: 'POST',
      headers: {
        'x-operation-id': 'op-create-a',
        'x-sequence-number': '1',
      },
      body: JSON.stringify({ saveId: 'save-a', state: { season: 1 } }),
    });

    const outOfOrder = await request('/api/v1/saves/save-a/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-seq-3',
        'x-sequence-number': '3',
      },
      body: JSON.stringify({ state: { season: 3 } }),
    });
    assert.equal(outOfOrder.status, 409);
    const conflict = (await outOfOrder.json()) as { error: string; expectedSequence: number };
    assert.equal(conflict.error, 'sequence_conflict');
    assert.equal(conflict.expectedSequence, 2);

    const seq2 = await request('/api/v1/saves/save-a/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-seq-2',
        'x-sequence-number': '2',
      },
      body: JSON.stringify({ state: { season: 2 } }),
    });
    assert.equal(seq2.status, 200);

    const seq3 = await request('/api/v1/saves/save-a/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-seq-3',
        'x-sequence-number': '3',
      },
      body: JSON.stringify({ state: { season: 3 } }),
    });
    assert.equal(seq3.status, 200);
  });

  it('detects operation-id conflicts when payload changes on retry', async () => {
    await request('/api/v1/saves/snapshots', {
      method: 'POST',
      headers: {
        'x-operation-id': 'op-create-b',
        'x-sequence-number': '1',
      },
      body: JSON.stringify({ saveId: 'save-b', state: { season: 1 } }),
    });

    const first = await request('/api/v1/saves/save-b/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-conflict',
        'x-sequence-number': '2',
      },
      body: JSON.stringify({ state: { season: 2 } }),
    });
    assert.equal(first.status, 200);

    const conflictingRetry = await request('/api/v1/saves/save-b/snapshot', {
      method: 'PUT',
      headers: {
        'x-operation-id': 'op-conflict',
        'x-sequence-number': '2',
      },
      body: JSON.stringify({ state: { season: 99 } }),
    });
    assert.equal(conflictingRetry.status, 409);
    const payload = (await conflictingRetry.json()) as { error: string };
    assert.equal(payload.error, 'operation_id_conflict');
  });
});
