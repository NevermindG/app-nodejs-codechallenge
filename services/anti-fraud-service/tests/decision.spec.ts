import { decide, LIMIT } from '../src/decision';

describe('anti-fraud decision', () => {
  it('approves when value <= LIMIT', () => {
    expect(decide(LIMIT)).toBe('approved');
    expect(decide(100)).toBe('approved');
  });
  it('rejects when value > LIMIT', () => {
    expect(decide(LIMIT + 1)).toBe('rejected');
  });
});
