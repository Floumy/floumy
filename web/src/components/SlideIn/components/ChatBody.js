import React from 'react';
import { ChatBody as StyledChatBody } from './StyledComponents';
import MessageList from './MessageList';

/**
 * ChatBody component for displaying the chat body
 *
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentStreamingMessage - Current message being streamed
 * @param {boolean} props.isTyping - Whether the AI is currently typing
 * @param {React.RefObject} props.messagesEndRef - Ref for scrolling to bottom
 * @returns {JSX.Element} The ChatBody component
 */
const ChatBody = ({
  messages,
  currentStreamingMessage,
  isTyping,
  messagesEndRef,
}) => {
  return (
    <StyledChatBody>
      <MessageList
        messages={messages}
        currentStreamingMessage={currentStreamingMessage}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />
    </StyledChatBody>
  );
};

export default ChatBody;
