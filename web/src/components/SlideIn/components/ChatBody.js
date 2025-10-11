import React from 'react';
import { ChatBody as StyledChatBody } from './StyledComponents';
import MessageList from './MessageList';
import LoadingSpinnerBox from '../../../views/pages/components/LoadingSpinnerBox';

/**
 * ChatBody component for displaying the chat body
 *
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.isTyping - Whether the AI is currently typing
 * @param {React.RefObject} props.messagesEndRef - Ref for scrolling to bottom
 * @returns {JSX.Element} The ChatBody component
 */
const ChatBody = ({
  messages,
  isTyping,
  messagesEndRef,
  isLoadingMessages,
}) => {
  if (isLoadingMessages) {
    return (
      <StyledChatBody>
        <LoadingSpinnerBox />
      </StyledChatBody>
    );
  }

  return (
    <StyledChatBody>
      <MessageList
        messages={messages}
        isTyping={isTyping}
        messagesEndRef={messagesEndRef}
      />
    </StyledChatBody>
  );
};

export default ChatBody;
