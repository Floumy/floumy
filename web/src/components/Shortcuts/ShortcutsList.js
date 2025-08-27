import React from 'react';
import styled from 'styled-components';
import KeyShortcut from './KeyShortcut';

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
`;

/**
 * ShortcutsList component
 *
 * Props:
 * - items: Array<{ keys: string[]; description: string; id?: string }>
 * - size?: 'sm' | 'md'
 * - className?: string
 *
 * Example:
 *   <ShortcutsList
 *     items=[
 *       { description: 'Command Palette', keys: ['Meta', 'K'] },
 *       { description: 'Search', keys: ['Meta', 'F'] },
 *     ]
 *   />
 */
export default function ShortcutsList({ items = [], size = 'md', className }) {
  return (
    <List className={className}>
      {items.map((it, idx) => (
        <ListItem key={it.id || `${it.description}-${idx}`}>
          <span>{it.description}</span>
          <KeyShortcut size={size} keys={it.keys} />
        </ListItem>
      ))}
    </List>
  );
}
