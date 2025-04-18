// Simple, framework-free test for useCardbuilder (ESM)
import { getCards } from './useCardbuilder.tsx';

function testGetCards() {
  const data = [
    { type: 'al1', id: 1, foo: 'bar' },
    { type: 't1', id: 2, baz: 'qux' },
    { type: 'unknown', id: 3 }
  ];
  const elements = getCards(data);
  console.log('Test getCards:');
  console.log(elements);
  if (!Array.isArray(elements)) throw new Error('getCards did not return an array');
  if (elements.length !== 2) throw new Error('getCards did not filter unknown types');
  console.log('PASS: getCards returns correct number of elements');
}

testGetCards();
