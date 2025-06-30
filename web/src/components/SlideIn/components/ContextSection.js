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
        <ContextSwitcher>
          <ContextSelect value={contextType} onChange={handleContextTypeChange}>
            <option value="okrs">Current Context</option>
            <option value="initiatives">Entire Project</option>
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
