import React from 'react';
import styled from 'styled-components';

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

const ShortcutKey = styled.span`
  background-color: #1e232b;
  color: #e1e1e1;
  font-weight: bold;
  padding: 4px;
  text-align: center;
  margin: 2px 0;
  border-radius: 4px;
  font-size: 12px;
  width: 27px;
  height: 27px;
`;

const ShortcutIcon = ({ itemName, shortcutKey }) => (
  <ShortcutContainer>
    <ItemName>{itemName}</ItemName>
    <ShortcutKey>{shortcutKey}</ShortcutKey>
  </ShortcutContainer>
);

export default ShortcutIcon;
