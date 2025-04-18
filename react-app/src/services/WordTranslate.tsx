import React, { useState, useRef } from 'react';

/**
 * WordTranslate component
 * Shows a word with a translation popup/tooltip on hover or tap, mimicking Angular's wordtranslate.directive.ts
 * @param word - The word to display
 * @param getTranslation - Function to fetch translation for the word (async or sync)
 * @param iconPosition - Optional icon position ("left" | "right")
 * @param iconHide - Optional, hide translation icon
 */
export function WordTranslate({
  word,
  getTranslation,
  iconPosition = 'right',
  iconHide = false,
}: {
  word: string;
  getTranslation: (word: string) => Promise<string> | string;
  iconPosition?: 'left' | 'right';
  iconHide?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [translation, setTranslation] = useState<string | null>(null);
  const ref = useRef<HTMLSpanElement | null>(null);

  const handleShow = async () => {
    setShow(true);
    if (!translation) {
      const result = await getTranslation(word);
      setTranslation(result);
    }
  };
  const handleHide = () => setShow(false);

  return (
    <span
      ref={ref}
      className={`translainable-word${iconPosition ? '-' + iconPosition : ''}` + (iconHide ? ' translation-icon-hide' : '')}
      onMouseOver={handleShow}
      onMouseLeave={handleHide}
      onTouchStart={handleShow}
      onTouchEnd={handleHide}
      style={{ position: 'relative', cursor: 'pointer', background: '#f8f8ff', borderRadius: 4, padding: '0 4px', margin: '0 2px' }}
    >
      {word}
      {!iconHide && <span style={{ marginLeft: 4, color: '#888' }}>?</span>}
      {show && translation && (
        <span style={{
          position: 'absolute',
          top: '100%',
          left: iconPosition === 'left' ? 0 : 'auto',
          right: iconPosition === 'right' ? 0 : 'auto',
          background: '#fff',
          border: '1px solid #ccc',
          borderRadius: 4,
          padding: '4px 8px',
          whiteSpace: 'nowrap',
          zIndex: 10,
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>{translation}</span>
      )}
    </span>
  );
}

// Usage Example:
// <WordTranslate word="cat" getTranslation={async w => await fetchTranslation(w)} />
