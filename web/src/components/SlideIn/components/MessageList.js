import React from 'react';
import DOMPurify from 'dompurify';
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
import { formatTimestamp, markdownToHtml } from './utils';

/**
 * MessageList component for displaying chat messages
 *
 * @param {Object} props - Component props
 * @param {Array} props.messages - Array of message objects
 * @param {string} props.currentStreamingMessage - Current message being streamed
 * @param {boolean} props.isTyping - Whether the AI is currently typing
 * @param {React.RefObject} props.messagesEndRef - Ref for scrolling to bottom
 * @returns {JSX.Element} The MessageList component
 */
const MessageList = ({
  messages,
  currentStreamingMessage,
  isTyping,
  messagesEndRef,
}) => {
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
              {message.isUser ? 'U' : 'AI'}
            </MessageAvatar>
            <div style={{ flex: 1 }}>
              <MessageHeader>
                <MessageSender isUser={message.isUser}>
                  {message.isUser ? 'You' : 'AI Assistant'}
                </MessageSender>
                <Timestamp>{formatTimestamp(message.timestamp)}</Timestamp>
              </MessageHeader>
              <MessageContent>
                {message.isUser ? (
                  message.text
                ) : (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(markdownToHtml(message.text)),
                    }}
                  />
                )}
              </MessageContent>
            </div>
          </MessageRow>
        ))}

        {/* Streaming message */}
        {currentStreamingMessage && (
          <MessageRow
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageAvatar isUser={false}>AI</MessageAvatar>
            <div style={{ flex: 1 }}>
              <MessageHeader>
                <MessageSender isUser={false}>AI Assistant</MessageSender>
                <Timestamp>{formatTimestamp(new Date())}</Timestamp>
              </MessageHeader>
              <MessageContent>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      markdownToHtml(currentStreamingMessage),
                    ),
                  }}
                />
              </MessageContent>
            </div>
          </MessageRow>
        )}

        {/* Loading indicator */}
        {isTyping && (
          <MessageRow
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <MessageAvatar isUser={false}>AI</MessageAvatar>
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
