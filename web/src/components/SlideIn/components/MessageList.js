import React from 'react';
import {
  MessageAvatar,
  MessageContainer,
  MessageContent,
  MessageHeader,
  MessageList as StyledMessageList,
  MessageRow,
  MessageSender,
  Timestamp,
} from './StyledComponents';
import { formatTimestamp } from './utils';
import { useCurrentUser } from '../../../contexts/CurrentUserContext';
import { memberNameInitials } from '../../../services/utils/utils';
import ReactMarkdown from 'react-markdown';

/**
 * MessageList component for displaying chat messages
 *
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {boolean} props.isTyping - Whether the AI is currently typing
 * @param {React.RefObject} props.messagesEndRef - Ref for scrolling to bottom
 * @returns {JSX.Element} The MessageList component
 */
const MessageList = ({ messages, isTyping, messagesEndRef }) => {
  const { currentUser } = useCurrentUser();

  return (
    <StyledMessageList>
      <MessageContainer>
        {messages.map((message) => (
          <MessageRow
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageAvatar isUser={message.isUser}>
              {message.isUser ? memberNameInitials(currentUser.name) : 'AI'}
            </MessageAvatar>
            <div style={{ flex: 1 }}>
              <MessageContent>
                {message.isUser ? (
                  message.text
                ) : (
                  <ReactMarkdown>{message.text}</ReactMarkdown>
                )}
              </MessageContent>
            </div>
          </MessageRow>
        ))}

        {/* Loading indicator */}
        {isTyping && (
          <MessageRow
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageAvatar>AI</MessageAvatar>
            <div style={{ flex: 1 }}>
              <MessageHeader>
                <MessageSender isUser={false}>AI Assistant</MessageSender>
                <Timestamp>{formatTimestamp(new Date())}</Timestamp>
              </MessageHeader>
              <MessageContent>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </MessageContent>
            </div>
          </MessageRow>
        )}

        <div ref={messagesEndRef} />
      </MessageContainer>
    </StyledMessageList>
  );
};

export default MessageList;
