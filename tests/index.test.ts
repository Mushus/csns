import { describe, it, expect } from 'vitest';
import { app } from '../src/index';

describe('/health endpoint', () => {
  it('should return { status: "ok" } with status 200', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok' });
  });
});
