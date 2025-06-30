import styled, { createGlobalStyle, css } from 'styled-components';
import { motion } from 'framer-motion';
import PerfectScrollbar from 'react-perfect-scrollbar';

// Styled components for the chat UI
export const ChatContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  right: 0;
  width: 600px;
  height: 100vh;
  background-color: #ffffff;
  border-radius: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 1000;
  resize: horizontal;
  min-width: 500px;
  border-left: 1px solid #e6e6e6;

  @media (max-width: 2000px) {
    box-shadow: -5px 0 25px rgba(0, 0, 0, 0.15);
    /* On medium or smaller screens, don't push content, just overlay */
    position: absolute;
  }
`;

export const ChatHeader = styled.div`
  padding: 16px 20px;
  background-color: white;
  color: #343541;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #e5e5e6;
`;

export const ContextContainer = styled.div`
  padding: 12px 20px;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e5e6;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ContextHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ContextTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
`;

export const ContextSwitcher = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const ContextItem = styled.div`
  background-color: white;
  border: 1px solid #e5e5e6;
  border-radius: 6px;
  padding: 10px 12px;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #343541;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export const ContextIcon = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background-color: ${(props) => props.color || '#f0e7fa'};
  color: ${(props) => props.iconColor || '#8a2be2'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

export const ContextInfo = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

export const ContextName = styled.div`
  font-weight: 500;
  margin-bottom: 2px;
`;

export const ContextMeta = styled.div`
  font-size: 11px;
  color: #6b7280;
`;

export const ContextSelect = styled.select`
  background-color: white;
  border: 1px solid #e5e5e6;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  color: #343541;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #8a2be2;
  }
`;

export const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #e5e5e6;
  background-color: white;
`;

export const Tab = styled.button`
  padding: 12px 20px;
  background-color: ${(props) => (props.active ? '#f9fafb' : 'white')};
  color: ${(props) => (props.active ? '#8a2be2' : '#6b7280')};
  border: none;
  border-bottom: 2px solid
    ${(props) => (props.active ? '#8a2be2' : 'transparent')};
  font-weight: ${(props) => (props.active ? '600' : '500')};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: #8a2be2;
    background-color: ${(props) =>
      props.active ? '#f9fafb' : 'rgba(249, 250, 251, 0.5)'};
  }

  &:focus {
    outline: none;
  }
`;

export const HistoryContainer = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

export const HistoryList = styled(PerfectScrollbar).attrs({
  options: { wheelPropagation: false },
})`
  flex: 1;
  padding: 0 20px;

  .ps__rail-y {
    background-color: transparent !important;
    width: 8px !important;

    .ps__thumb-y {
      background-color: rgba(138, 43, 226, 0.3) !important;
      width: 6px !important;
      right: 1px !important;
    }
  }
`;

export const HistoryItem = styled.div`
  padding: 16px;
  border-bottom: 1px solid #e5e5e6;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9fafb;
  }
`;

export const HistoryItemHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

export const HistoryItemTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: #343541;
`;

export const HistoryItemDate = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

export const HistoryItemPreview = styled.div`
  font-size: 13px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EmptyHistory = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 40px;
  text-align: center;
  color: #6b7280;

  i {
    font-size: 32px;
    margin-bottom: 16px;
    color: #d1d5db;
  }

  h4 {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
  }

  p {
    font-size: 14px;
    max-width: 300px;
  }
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ChatBody = styled.div`
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: white;
`;

export const MessageList = styled(PerfectScrollbar).attrs({
  options: { wheelPropagation: false },
})`
  flex: 1;
  padding: 0 20px;

  .ps__rail-y {
    background-color: transparent !important;
    width: 8px !important;

    .ps__thumb-y {
      background-color: rgba(138, 43, 226, 0.3) !important;
      width: 6px !important;
      right: 1px !important;
    }
  }
`;

export const MessageRow = styled(motion.div)`
  display: flex;
  padding: 16px 0;
  position: relative;
  width: 100%;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: rgba(249, 250, 251, 0.7);
  }
`;

export const MessageAvatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 4px;
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;

  ${(props) =>
    props.isUser
      ? `
    background-color: #8a2be2;
    color: white;
  `
      : `
    background-color: #f0e7fa;
    color: #8a2be2;
  `}
`;

export const MessageContent = styled.div`
  flex: 1;
  word-wrap: break-word;
  line-height: 1.6;
  font-size: 14px;
  color: #343541;
  max-width: calc(100% - 44px);
`;

export const MessageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

export const Timestamp = styled.div`
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  opacity: 0.8;
`;

export const MessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
`;

export const MessageSender = styled.div`
  font-weight: 600;
  font-size: 13px;
  color: ${(props) => (props.isUser ? '#8a2be2' : '#343541')};
  margin-right: 8px;
`;

export const ChatFooter = styled.div`
  padding: 20px 20px;
  border-top: 1px solid #e5e5e6;
  background-color: white;
  position: relative;
  z-index: 1;

  .input-container {
    position: relative;
    border-radius: 8px;
    min-height: 80px;
  }

  textarea.form-control {
    min-height: 80px;
    resize: none;
    padding: 12px 16px;
    line-height: 1.5;
    border: 2px solid #e5e5e6;
    border-radius: 8px;
    width: 100%;
    box-sizing: border-box;
  }
`;

export const ExamplePromptsContainer = styled.div`
  padding: 20px;
  border-top: 1px solid #e5e5e6;
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  background-color: #f9fafb;
  position: relative;
  overflow-x: auto;
  white-space: nowrap;
  scrollbar-width: thin;
  scrollbar-color: rgba(138, 43, 226, 0.3) transparent;
  overscroll-behavior: contain;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(138, 43, 226, 0.3);
    border-radius: 6px;
  }

  &:before {
    position: absolute;
    top: -10px;
    left: 20px;
    background-color: #f9fafb;
    padding: 0 8px;
    font-size: 12px;
    color: #6b7280;
    font-weight: 500;
  }
`;

export const ExamplePromptChip = styled.div`
  background-color: white;
  color: #6b21a8;
  border: 1px solid #e5e5e6;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  &:before {
    content: '✨';
    font-size: 14px;
  }

  &:hover {
    background: linear-gradient(135deg, #f9f5ff 0%, #fff 100%);
    color: #8a2be2;
    border-color: #d8b4fe;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

// Scoped styles for the chat components
export const ChatStyles = createGlobalStyle`
  ${() => css`
    /* These styles will only apply within the ChatContainer */
    ${ChatContainer} {
      .typing-indicator {
        display: flex;
        align-items: center;
        padding: 4px 0;
      }

      .typing-indicator span {
        height: 6px;
        width: 6px;
        margin: 0 2px;
        background-color: #8a2be2;
        border-radius: 50%;
        display: inline-block;
        animation: typing 1.4s infinite ease-in-out both;
        opacity: 0.6;
      }

      .typing-indicator span:nth-child(1) {
        animation-delay: 0s;
      }

      .typing-indicator span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .typing-indicator span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.5);
        }
        100% {
          transform: scale(1);
        }
      }

      /* Custom styling for input and button */
      .form-control {
        border-color: #e5e5e6;
        border-radius: 8px;
        padding: 10px 16px;
        font-size: 14px;
        transition: all 0.2s ease;
      }

      .form-control:focus {
        border-color: #8a2be2;
        outline: none;
        box-shadow: 0 0 0 1px rgba(138, 43, 226, 0.2);
      }

      .chat-input {
        font-size: 15px;
        line-height: 1.5;
        padding: 14px 18px;
        border-radius: 8px;
        height: auto;
        min-height: 80px;
        max-height: 200px;
        overflow-y: auto;
        overscroll-behavior: contain;
        transition: all 0.2s ease;
        box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.1);
      }

      .chat-input:focus {
        border-color: #8a2be2;
        box-shadow: 0 0 0 2px rgba(138, 43, 226, 0.2);
      }

      .input-container {
        position: relative;
      }

      .btn-primary {
        background-color: #8a2be2;
        border-color: #8a2be2;
        font-weight: 500;
        transition: all 0.2s ease;
      }

      .send-button {
        position: absolute;
        bottom: 10px;
        right: 10px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        font-size: 14px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .btn-primary:hover,
      .btn-primary:focus {
        background-color: #7823c7;
        border-color: #7823c7;
      }

      code {
        background-color: rgba(138, 43, 226, 0.05);
        padding: 3px 6px;
        border-radius: 4px;
        font-family:
          'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
        font-size: 13px;
        color: #6b21a8;
        border: 1px solid rgba(138, 43, 226, 0.1);
      }

      pre {
        background-color: #f9fafb;
        padding: 12px 16px;
        border-radius: 6px;
        overflow-x: auto;
        overscroll-behavior: contain;
        margin: 12px 0;
        border: 1px solid #e5e5e6;
      }

      pre code {
        background-color: transparent;
        padding: 0;
        color: #343541;
        border: none;
        font-size: 12px;
        line-height: 1.6;
      }

      a {
        color: #8a2be2;
        text-decoration: underline;
        transition: color 0.2s ease;
      }

      a:hover {
        color: #7823c7;
      }

      ul {
        padding-left: 20px;
        margin: 12px 0;
      }

      li {
        margin-bottom: 6px;
      }

      p {
        margin: 0 0 12px 0;
        line-height: 1.6;
      }

      /* Add subtle animations */
      .message-enter {
        opacity: 0;
        transform: translateY(10px);
      }

      .message-enter-active {
        opacity: 1;
        transform: translateY(0);
        transition:
          opacity 300ms,
          transform 300ms;
      }
    }
  `}
`;
