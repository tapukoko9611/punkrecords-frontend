import { useState, useEffect, useRef } from 'react';
import { useDebounce } from './useDebounce';

export const TextSpace = ({ editorContent, onTextChange }) => {
  const [content, setContent] = useState(editorContent || '');
  const lines = content.split('\n');
  const textAreaRef = useRef(null);
  const lineNumberRef = useRef(null);

  const debouncedUpdate = useDebounce((newContent) => {
    onTextChange(newContent);
  }, 300);

  const handleChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    debouncedUpdate(newContent);
  };

  const handleScroll = () => {
    if (lineNumberRef.current && textAreaRef.current) {
      lineNumberRef.current.scrollTop = textAreaRef.current.scrollTop;
    }
  };

  return (
    <div
      className="editor-wrapper"
      style={{
        display: 'grid',
        gridTemplateColumns: '50px 1fr',
        position: 'relative',
        height: '100%',
        overflow: 'hidden',
        color: '#555'
      }}
    >
      {/* Line Numbers Pane */}
      <div
        ref={lineNumberRef}
        style={{
          backgroundColor: '#2d2d2d',
          color: '#999',
          padding: '4px 8px',
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '20px',
          textAlign: 'right',
          overflowY: 'hidden'
        }}
      >
        {lines.map((_, i) => (
          <div key={i} style={{ height: '20px' }}>
            {i + 1}
          </div>
        ))}
      </div>

      {/* Text Editing Pane */}
      <textarea
        ref={textAreaRef}
        value={content}
        onChange={handleChange}
        onScroll={handleScroll}
        spellCheck="false"
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          lineHeight: '20px',
          padding: '4px 8px',
          resize: 'none',
          overflow: 'auto',
          border: 'none',
          outline: 'none',
          width: '100%',
          height: '100%'
        }}
      />
    </div>
  );
};

export const TextSpace1 = ({ editor, onTextChange }) => {
  const [text, setText] = useState(editor.content);
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);
  const editorContainerRef = useRef(null);

  // Split text by lines
  const lines = text.split('\n');

  const debouncedUpdate = useDebounce((newContent) => {
    onTextChange(newContent);
  }, 300);

  useEffect(() => {
    if (editor.content !== text) {
      setText(editor.content);
    }
  }, [editor.content]);

  const handleChange = (event) => {
    const newText = event.target.value;
    setText(newText);
    // if (onTextChange) {
    //   onTextChange(newText);
    // }
    debouncedUpdate(newText);
  };

  // Sync scroll positions of text and line numbers
  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
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
          overflowX: 'hidden',
          overflowY: 'hidden',
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

// module.exports = {TextSpace, TextSpace1}
