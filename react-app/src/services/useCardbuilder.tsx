// CardbuilderService equivalent for React
// Dynamically maps card data to React components
import React from 'react';
// Import your React activity components here
// Example:
// import { Al1Component } from '../activities/al1/Al1Component';
// import { CarComponent } from '../activities/car/CarComponent';

// TODO: Replace these with your real component imports
const Al1Component = (props: any) => <div>AL1 {JSON.stringify(props)}</div>;
const CarComponent = (props: any) => <div>CAR {JSON.stringify(props)}</div>;
// ...repeat for all activity types

const cardTypeMap: Record<string, React.ComponentType<any>> = {
  al1: Al1Component,
  t1: CarComponent,
  // al2: Al2Component,
  // ar1: Ar1Component,
  // ...etc (add all mappings as in Angular)
};

export function getCards(data: any[]): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  for (const c of data) {
    const Comp = cardTypeMap[c.type];
    if (Comp) {
      out.push(<Comp key={c.id || c.type + Math.random()} {...c} />);
    }
  }
  return out;
}
