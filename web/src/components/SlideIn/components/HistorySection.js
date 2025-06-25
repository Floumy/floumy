import React from 'react';
import { Button } from 'reactstrap';
import {
  HistoryContainer,
  HistoryList,
  HistoryItem,
  HistoryItemHeader,
  HistoryItemTitle,
  HistoryItemDate,
  HistoryItemPreview,
  EmptyHistory,
} from './StyledComponents';

/**
 * HistorySection component for displaying chat history
 * 
 * @param {Object} props - Component props
 * @param {Array} props.chatSessions - Array of chat session objects
 * @param {Function} props.loadChatSession - Function to load a chat session
 * @param {Function} props.startNewSession - Function to start a new chat session
 * @returns {JSX.Element} The HistorySection component
 */
const HistorySection = ({ 
  chatSessions, 
  loadChatSession, 
  startNewSession 
}) => {
  return (
    <HistoryContainer>
      <HistoryList>
        {chatSessions.length > 0 ? (
          chatSessions.map((session) => (
            <HistoryItem
              key={session.id}
              onClick={() => loadChatSession(session.id)}
            >
              <HistoryItemHeader>
                <HistoryItemTitle>{session.title}</HistoryItemTitle>
                <HistoryItemDate>
                  {new Date(session.date).toLocaleDateString()}{' '}
                  {new Date(session.date).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </HistoryItemDate>
              </HistoryItemHeader>
              <HistoryItemPreview>
                {session.preview}
              </HistoryItemPreview>
            </HistoryItem>
          ))
        ) : (
          <EmptyHistory>
            <i className="ni ni-time-alarm"></i>
            <h4>No chat history yet</h4>
            <p>
              Your chat history will appear here once you start
              conversations.
            </p>
          </EmptyHistory>
        )}
      </HistoryList>
      <div
        style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e5e6',
        }}
      >
        <Button color="primary" block onClick={startNewSession}>
          <i
            className="ni ni-chat-round"
            style={{ marginRight: '8px' }}
          ></i>
          Start New Chat
        </Button>
      </div>
    </HistoryContainer>
  );
};

export default HistorySection;