import React, { useEffect, useRef, useState } from 'react';

const AutoResizeTextarea = ({ value }) => {
  const [height, setHeight] = useState('auto');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      setHeight('auto'); // Reset height to 'auto' to get the correct scrollHeight
      setHeight(`${textareaRef.current.scrollHeight}px`); // Set height to scrollHeight
    }
  }, [value]);

  return (
    <textarea
      ref={textareaRef}
      value={value}
      className="text-gray-dark"
      style={{
        width: '100%',
        border: 'none',
        resize: 'none',
        height,
        overflow: 'hidden',
      }}
      readOnly={true}
    />
  );
};

export default AutoResizeTextarea;
