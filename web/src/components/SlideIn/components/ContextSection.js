import React from 'react';
import { ContextContainer, ContextHeader, ContextSelect, ContextSwitcher, } from './StyledComponents';

/**
 * ContextSection component for displaying and managing context
 *
 * @param {Object} props - Component props
 * @param {string} props.contextType - Current context type
 * @param {Function} props.handleContextTypeChange - Handler for context type change
 * @returns {JSX.Element} The ContextSection component
 */
const ContextSection = ({ contextType, handleContextTypeChange }) => {
  return (
    <ContextContainer>
      <ContextHeader>
        <ContextSwitcher>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Context:</span>
          <ContextSelect
            value={contextType}
            onChange={handleContextTypeChange}
            disabled={true}
          >
            <option value="project">Current Project</option>
          </ContextSelect>
        </ContextSwitcher>
      </ContextHeader>

      {/*/!* Selected context item *!/*/}
      {/*<ContextItem>*/}
      {/*  <ContextIcon*/}
      {/*    color={selectedContext.color}*/}
      {/*    iconColor={selectedContext.iconColor}*/}
      {/*  >*/}
      {/*    <i className={`ni ${selectedContext.icon}`}></i>*/}
      {/*  </ContextIcon>*/}
      {/*  <ContextInfo>*/}
      {/*    <ContextName>{selectedContext.name}</ContextName>*/}
      {/*    /!*<ContextMeta>{selectedContext.meta}</ContextMeta>*!/*/}
      {/*  </ContextInfo>*/}
      {/*</ContextItem>*/}
    </ContextContainer>
  );
};

export default ContextSection;
