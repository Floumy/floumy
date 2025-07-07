import React from 'react';
import { Button, Input } from 'reactstrap';
import {
  ChatFooter,
  ExamplePromptChip,
  ExamplePromptsContainer,
} from './StyledComponents';

/**
 * ChatInput component for handling user input
 *
 * @param {Object} props - Component props
 * @param {string} props.inputValue - Current input value
 * @param {Function} props.setInputValue - Function to update input value
 * @param {Function} props.handleSendMessage - Function to handle sending a message
 * @param {boolean} props.isTyping - Whether the AI is currently typing
 * @param {Array} props.examplePrompts - Array of example prompts
 * @param {Function} props.handleSelectPrompt - Function to handle selecting an example prompt
 * @returns {JSX.Element} The ChatInput component
 */
const ChatInput = ({
  inputValue,
  setInputValue,
  handleSendMessage,
  isTyping,
  examplePrompts,
  handleSelectPrompt,
  showExamplePrompts = true,
}) => {
  return (
    <>
      {showExamplePrompts && (
        <ExamplePromptsContainer>
          {examplePrompts.map((prompt, index) => (
            <ExamplePromptChip
              key={index}
              onClick={() => handleSelectPrompt(prompt)}
            >
              {prompt}
            </ExamplePromptChip>
          ))}
        </ExamplePromptsContainer>
      )}

      <ChatFooter>
        <div className="input-container">
          <Input
            type="textarea"
            placeholder="Type a message or use Shift+Enter for a new line..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && inputValue.trim()) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={3}
            className={`chat-input ${inputValue.trim() ? 'with-button' : ''}`}
            data-gramm="false"
            data-gramm_editor="false"
            data-enable-grammarly="false"
            spellCheck="false"
          />
          {inputValue.trim() && (
            <Button
              color="primary"
              onClick={handleSendMessage}
              disabled={isTyping}
              className="send-button"
            >
              <i className="ni ni-send"></i>
            </Button>
          )}
        </div>
      </ChatFooter>
    </>
  );
};

export default ChatInput;
