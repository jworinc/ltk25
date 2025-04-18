import { useState, useCallback } from 'react';

export function useCustomField() {
  const [fields, setFieldsState] = useState<any[]>([]);
  const [hasStartScreen, setHasStartScreen] = useState(false);
  const [hasStartLesson, setHasStartLesson] = useState(false);
  const [hasEndScreen, setHasEndScreen] = useState(false);
  const [hasEndLesson, setHasEndLesson] = useState(false);

  // Checks and updates booleans based on fields
  const checkFields = useCallback((fieldsToCheck: any[]) => {
    let startScreen = false, startLesson = false, endScreen = false, endLesson = false;
    for (const f of fieldsToCheck) {
      if (typeof f.place !== 'undefined') {
        if (f.place === 'lesson_begin') startLesson = true;
        if (f.place === 'begin_screen') startScreen = true;
        if (f.place === 'lesson_end') endLesson = true;
        if (f.place === 'end_screen') endScreen = true;
      }
    }
    setHasStartScreen(startScreen);
    setHasStartLesson(startLesson);
    setHasEndScreen(endScreen);
    setHasEndLesson(endLesson);
  }, []);

  const setFields = useCallback((newFields: any[]) => {
    setFieldsState(newFields);
    checkFields(newFields);
  }, [checkFields]);

  const getStartLesson = useCallback(() => {
    for (const f of fields) {
      if (typeof f.place !== 'undefined' && f.place === 'lesson_begin') return f.content;
    }
    return '';
  }, [fields]);

  const getStartScreen = useCallback(() => {
    for (const f of fields) {
      if (typeof f.place !== 'undefined' && f.place === 'begin_screen') return f.content;
    }
    return '';
  }, [fields]);

  const getEndScreen = useCallback(() => {
    for (const f of fields) {
      if (typeof f.place !== 'undefined' && f.place === 'end_screen') return f.content;
    }
    return '';
  }, [fields]);

  const getEndLesson = useCallback(() => {
    for (const f of fields) {
      if (typeof f.place !== 'undefined' && f.place === 'lesson_end') return f.content;
    }
    return '';
  }, [fields]);

  // Card manipulation helpers
  const addStartCardToLesson = useCallback((cards: any[], cpos: number) => {
    const cfc = {
      activity: 'CFC',
      audio: [],
      comment: 'Custom field card lesson start',
      content: [getStartLesson()],
      cross_number: 1,
      display_number: 1,
      id: 0,
      lesson: '',
      pos: 2,
      position: 1,
      type: 'cfc',
    };
    for (const card of cards) card.pos++;
    cards.push(cfc);
    return cpos === 2 ? 2 : cpos + 1;
  }, [getStartLesson]);

  const addEndCardToLesson = useCallback((cards: any[]) => {
    let lcp = 0;
    for (const card of cards) if (lcp < card.pos) lcp = card.pos;
    const cfc = {
      activity: 'CFC',
      audio: [],
      comment: 'Custom field card lesson end',
      content: [getEndLesson()],
      cross_number: lcp + 1,
      display_number: lcp + 1,
      id: 0,
      lesson: '',
      pos: lcp + 1,
      position: lcp + 1,
      type: 'cfc',
    };
    cards.push(cfc);
  }, [getEndLesson]);

  const addStartCardToTest = useCallback((cards: any[], cpos: number) => {
    const cfc = {
      activity: 'CFT',
      comment: 'Custom field card lesson start',
      cross_number: 1,
      display_number: 1,
      id: 0,
      lesson: '',
      content: [getStartLesson()],
      description: '',
      pos: 1,
      position: 1,
      type: 'cft',
    };
    for (const card of cards) card.position++;
    cards.push(cfc);
    return cpos === 2 ? 2 : cpos + 1;
  }, [getStartLesson]);

  const addEndCardToTest = useCallback((cards: any[]) => {
    let lcp = 0;
    for (const card of cards) if (lcp < card.position) lcp = card.position;
    const cfc = {
      activity: 'CFT',
      audio: [],
      comment: 'Custom field card lesson end',
      content: [getEndLesson()],
      cross_number: lcp + 1,
      display_number: lcp + 1,
      description: '',
      id: 0,
      lesson: '',
      pos: lcp + 1,
      position: lcp + 1,
      type: 'cft',
    };
    cards.push(cfc);
  }, [getEndLesson]);

  return {
    fields,
    setFields,
    hasStartScreen,
    hasStartLesson,
    hasEndScreen,
    hasEndLesson,
    getStartLesson,
    getStartScreen,
    getEndScreen,
    getEndLesson,
    addStartCardToLesson,
    addEndCardToLesson,
    addStartCardToTest,
    addEndCardToTest,
  };
}
