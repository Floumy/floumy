import React from 'react';
import {
  EmptyHistory,
  HistoryContainer,
  HistoryItem,
  HistoryItemDate,
  HistoryItemHeader,
  HistoryItemPreview,
  HistoryItemTitle,
  HistoryList,
} from './StyledComponents';

/**
 * HistorySection component for displaying chat history
 *
 * @param {Object} props - Component props
 * @param {Array} props.chatSessions - Array of chat session objects
 * @param {Function} props.loadChatSession - Function to load a chat session
 * @returns {JSX.Element} The HistorySection component
 */
const HistorySection = ({ chatSessions, loadChatSession }) => {
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
              <HistoryItemPreview>{session.preview}</HistoryItemPreview>
            </HistoryItem>
          ))
        ) : (
          <EmptyHistory>
            <i className="ni ni-time-alarm"></i>
            <h4>No chat history yet</h4>
            <p>
              Your chat history will appear here once you start conversations.
            </p>
          </EmptyHistory>
        )}
      </HistoryList>
    </HistoryContainer>
  );
};

export default HistorySection;
