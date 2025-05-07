import { useState, useEffect, useRef } from 'react';

const TextSpace = ({ editor, onTextChange }) => {
  const [text, setText] = useState(editor.text);  // Local state for the text content
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Split text by lines
  const lines = text.split('\n');

  // Sync local state with the prop `editor.text`
  useEffect(() => {
    if (editor.text !== text) {
      setText(editor.text);  // Update local state whenever the `editor.text` prop changes
    }
  }, [editor.text]);  // Only re-run when `editor.text` changes

  const handleChange = (event) => {
    const newText = event.target.value;
    setText(newText);  // Update local state on text change
    if (onTextChange) {
      onTextChange(newText);  // Propagate change to parent
    }
  };

  // Sync scroll positions of text and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      // Sync horizontal scroll as well
      lineNumbersRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleClickLineNumber = (index) => {
    if (textareaRef.current) {
      let cursorIndex = 0;
      for (let i = 0; i < index; i++) {
        cursorIndex += lines[i].length + 1; // Account for newline
      }
      textareaRef.current.focus();
      textareaRef.current.selectionStart = cursorIndex;
      textareaRef.current.selectionEnd = cursorIndex;
    }
  };

  return (
    <div
      ref={editorContainerRef}
      className="font-mono flex overflow-x-auto"
      style={{ position: 'relative', height: '100vh' }}
    >
      {/* Line Numbers */}
      <div
        ref={lineNumbersRef}
        className="w-12 pr-2 text-right text-gray-500 text-sm pt-2 flex-shrink-0 sticky left-0 bg-gray-900 select-none"
        style={{
          maxHeight: '100%',
          overflowX: 'hidden',      // Prevent horizontal overflow on line numbers
          overflowY: 'hidden',      // Prevent vertical overflow on line numbers
        }}
      >
        {lines.map((_, index) => (
          <span
            key={index}
            className="block leading-tight py-0.5 cursor-pointer"
            onClick={() => handleClickLineNumber(index)}
          >
            {index + 1}
          </span>
        ))}
      </div>

      {/* Textarea (Editable Area) */}
      <textarea
        ref={textareaRef}
        className="pl-2 pt-2 bg-transparent border-none outline-none text-sm font-mono w-full h-full resize-none overflow-y-auto"
        value={text}
        onChange={handleChange}
        onScroll={handleScroll}
        style={{
          whiteSpace: 'pre',         // Prevent line breaks at all costs
          overflowX: 'auto',        // Allow horizontal scroll
          overflowY: 'auto',        // Allow vertical scroll
          wordWrap: 'normal',       // Allow word overflow horizontally
          lineHeight: '1.5em',       // To adjust line spacing for better readability
        }}
      />
    </div>
  );
};

export default TextSpace;
