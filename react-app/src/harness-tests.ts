// harness-tests.ts
// Define all available test routines for Harness UI
import * as dataloader from './services/dataloader';

export type HarnessTest = {
  name: string;
  label: string;
  run: () => Promise<any>;
};

import { getCards as getCardbuilderCards } from './services/useCardbuilder.tsx';

export const sampleCardData = [
  { type: 'al1', id: 1, foo: 'bar' },
  { type: 't1', id: 2, baz: 'qux' },
  { type: 'unknown', id: 3 }
];

export const harnessTests: HarnessTest[] = [
  {
    name: 'studentInfo',
    label: 'Fetch Student Info',
    run: () => dataloader.getStudentInfo(),
  },
  {
    name: 'lessons',
    label: 'Fetch Lessons',
    run: () => dataloader.getLessons(),
  },
  {
    name: 'cards',
    label: 'Fetch Cards (lessonId=1)',
    run: () => dataloader.getCards(1),
  },
  {
    name: 'options',
    label: 'Fetch Options',
    run: () => dataloader.getOptions(),
  },
  {
    name: 'cardbuilder',
    label: 'Test Cardbuilder (sample data)',
    run: async () => getCardbuilderCards(sampleCardData),
  },
];

export function getTestByName(name: string): HarnessTest | undefined {
  return harnessTests.find(t => t.name === name);
}
