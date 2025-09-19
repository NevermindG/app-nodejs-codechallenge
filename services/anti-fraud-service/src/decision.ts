export const LIMIT = 1000;
export type Decision = 'approved' | 'rejected';
export function decide(value: number): Decision {
  return value > LIMIT ? 'rejected' : 'approved';
}
