import React from 'react';
import { TabsContainer, Tab } from './StyledComponents';

/**
 * TabsSection component for displaying and managing tabs
 *
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.setActiveTab - Function to set the active tab
 * @returns {JSX.Element} The TabsSection component
 */
const TabsSection = ({ activeTab, setActiveTab }) => {
  return (
    <TabsContainer>
      <Tab active={activeTab === 'chat'} onClick={() => setActiveTab('chat')}>
        <i className="ni ni-chat-round" style={{ fontSize: '14px' }}></i>
        Chat
      </Tab>
      <Tab
        active={activeTab === 'history'}
        onClick={() => setActiveTab('history')}
      >
        <i className="ni ni-time-alarm" style={{ fontSize: '14px' }}></i>
        History
      </Tab>
    </TabsContainer>
  );
};

export default TabsSection;
