import React from 'react';
import {
  ContextContainer,
  ContextHeader,
  ContextIcon,
  ContextInfo,
  ContextItem,
  ContextMeta,
  ContextName,
  ContextSelect,
  ContextSwitcher,
  ContextTitle,
} from './StyledComponents';

/**
 * ContextSection component for displaying and managing context
 *
 * @param {Object} props - Component props
 * @param {string} props.contextType - Current context type
 * @param {Object} props.selectedContext - Currently selected context
 * @param {Function} props.handleContextTypeChange - Handler for context type change
 * @returns {JSX.Element} The ContextSection component
 */
const ContextSection = ({
  contextType,
  selectedContext,
  handleContextTypeChange,
}) => {
  return (
    <ContextContainer>
      <ContextHeader>
        <ContextTitle>Current Context</ContextTitle>
        <ContextSwitcher>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Change:</span>
          <ContextSelect value={contextType} onChange={handleContextTypeChange}>
            <option value="okrs">Current</option>
            <option value="initiatives">Everything</option>
          </ContextSelect>
        </ContextSwitcher>
      </ContextHeader>

      {/* Selected context item */}
      <ContextItem>
        <ContextIcon
          color={selectedContext.color}
          iconColor={selectedContext.iconColor}
        >
          <i className={`ni ${selectedContext.icon}`}></i>
        </ContextIcon>
        <ContextInfo>
          <ContextName>{selectedContext.name}</ContextName>
          <ContextMeta>{selectedContext.meta}</ContextMeta>
        </ContextInfo>
      </ContextItem>
    </ContextContainer>
  );
};

export default ContextSection;
