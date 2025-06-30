import React from 'react';
import { Button } from 'reactstrap';
import {
  ChatHeader as StyledChatHeader,
  HeaderActions,
} from './StyledComponents';

/**
 * ChatHeader component for displaying the chat header
 *
 * @param {Object} props - Component props
 * @param {Function} props.toggle - Function to toggle the chat visibility
 * @param {Function} props.startNewSession - Function to start a new chat session
 * @returns {JSX.Element} The ChatHeader component
 */
const ChatHeader = ({ toggle, startNewSession }) => {
  return (
    <StyledChatHeader>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '6px',
            backgroundColor: '#f0e7fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px',
          }}
        >
          <i
            className="ni ni-atom"
            style={{ color: '#8a2be2', fontSize: '14px' }}
          ></i>
        </div>
        <span style={{ fontWeight: '600', color: '#343541' }}>
          AI Assistant
        </span>
      </div>
      <HeaderActions>
        <Button
          color="success"
          size="sm"
          onClick={startNewSession}
          style={{
            marginRight: '10px',
            display: 'flex',
            alignItems: 'center',
            padding: '0.375rem 0.75rem',
          }}
        >
          <i className="ni ni-fat-add" style={{ marginRight: '5px' }}></i>
          New Chat
        </Button>
        <Button
          close
          onClick={toggle}
          style={{
            color: '#6b7280',
            opacity: 0.6,
            transition: 'opacity 0.2s ease',
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseOut={(e) => (e.currentTarget.style.opacity = '0.6')}
        />
      </HeaderActions>
    </StyledChatHeader>
  );
};

export default ChatHeader;
