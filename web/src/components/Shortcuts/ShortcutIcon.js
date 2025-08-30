import React from 'react';
import styled from 'styled-components';
import { KeyShortcut } from './index';

// Styled-components for the shortcut display
const ShortcutContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 2px;
`;

const ItemName = styled.span`
  font-size: 12px;
  margin-right: 8px;
  color: #ffffff;
`;

const ShortcutIcon = ({ itemName, shortcutKey }) => (
  <ShortcutContainer className="py-1">
    <ItemName>{itemName}</ItemName>
    <KeyShortcut keys={[shortcutKey]} />
  </ShortcutContainer>
);

export default ShortcutIcon;
