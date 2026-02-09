import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

describe('Integration Test', () => {
  it('should export all expected functions and types', async () => {
    const module = await import('../src/index');

    expect(module.skipIfJiraOpen).toBeDefined();
    expect(typeof module.skipIfJiraOpen).toBe('function');
    expect(module.globalSetup).toBeDefined();
    expect(typeof module.globalSetup).toBe('function');
  });

  it('should have correct TypeScript types exported', async () => {
    const module = await import('../src/types');

    // This test verifies the types can be imported
    // Type checking is done at compile time by TypeScript
    expect(module).toBeDefined();
  });
});
