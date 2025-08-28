import React from 'react';
import styled, { css } from 'styled-components';

// Platform helpers and key formatting
const isMacOS = () => {
  if (typeof navigator !== 'undefined') {
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  }
  return false;
};
// Returns display label for a given key, using symbols on macOS
const formatDisplayKey = (key) => {
  const k = String(key);
  if (isMacOS()) {
    switch (k) {
      case 'Meta':
        return '⌘';
      case 'Shift':
        return '⇧';
      case 'Alt':
      case 'Option':
        return '⌥';
      case 'Ctrl':
      case 'Control':
        return '⌃';
      case 'Enter':
      case 'Return':
        return '↩';
      case 'Backspace':
        return '⌫';
      case 'Delete':
        return '⌦';
      case 'Escape':
      case 'Esc':
        return '⎋';
      case 'Tab':
        return '⇥';
      case 'ArrowUp':
        return '↑';
      case 'ArrowDown':
        return '↓';
      case 'ArrowLeft':
        return '←';
      case 'ArrowRight':
        return '→';
      default:
        return k.length === 1 ? k.toUpperCase() : k;
    }
  }
  // Non-macOS: keep readable labels; still use arrow symbols
  switch (k) {
    case 'Meta':
      return 'Ctrl';
    case 'ArrowUp':
      return '↑';
    case 'ArrowDown':
      return '↓';
    case 'ArrowLeft':
      return '←';
    case 'ArrowRight':
      return '→';
    default:
      return k.length === 1 ? k.toUpperCase() : k;
  }
};

// Returns a readable label for aria (avoid symbols for SRs)
const formatAriaKey = (key) => {
  const k = String(key);
  switch (k) {
    case 'Meta':
      return isMacOS() ? 'Command' : 'Ctrl';
    case 'Ctrl':
    case 'Control':
      return 'Ctrl';
    case 'Alt':
    case 'Option':
      return isMacOS() ? 'Option' : 'Alt';
    case 'Shift':
      return 'Shift';
    case 'Enter':
    case 'Return':
      return 'Enter';
    case 'Backspace':
      return 'Backspace';
    case 'Delete':
      return 'Delete';
    case 'Escape':
    case 'Esc':
      return 'Escape';
    case 'Tab':
      return 'Tab';
    case 'ArrowUp':
      return 'Arrow Up';
    case 'ArrowDown':
      return 'Arrow Down';
    case 'ArrowLeft':
      return 'Arrow Left';
    case 'ArrowRight':
      return 'Arrow Right';
    default:
      return k.toUpperCase();
  }
};

const sizes = {
  sm: {
    font: '11px',
    capHeight: '22px',
    capMinWidth: '22px',
    padding: '2px 6px',
    gap: '4px',
  },
  md: {
    font: '12px',
    capHeight: '26px',
    capMinWidth: '26px',
    padding: '3px 8px',
    gap: '6px',
  },
};

const Container = styled.span`
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${(p) => sizes[p.$size || 'md'].gap};
  color: inherit;
`;

const Description = styled.span`
  margin-right: 8px;
  opacity: 0.9;
  font-size: ${(p) => sizes[p.$size || 'md'].font};
`;

const KeyCap = styled.kbd`
  background: #1e232b;
  color: #e6e6e6;
  border-radius: 6px;
  padding: ${(p) => sizes[p.$size || 'md'].padding};
  min-width: ${(p) => sizes[p.$size || 'md'].capMinWidth};
  height: ${(p) => sizes[p.$size || 'md'].capHeight};
  line-height: 1;
  text-align: center;
  font-weight: 600;
  font-size: ${(p) => sizes[p.$size || 'md'].font};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
    'Courier New', monospace;
  letter-spacing: 0.2px;
  user-select: none;
`;

const Plus = styled.span`
  opacity: 0.7;
  ${(p) => css`
    font-size: ${sizes[p.$size || 'md'].font};
  `}
`;

/**
 * KeyShortcut component
 *
 * Props:
 * - keys: Array<string> list of keys in order, e.g., ['Meta', 'K'] or ['Ctrl', 'Shift', 'P']
 * - description?: string optional description label shown before the keys
 * - size?: 'sm' | 'md' visual size, default 'md'
 * - separator?: string separator between keys, default '+'
 * - className?: string for styled-components or custom classes
 *
 * Notes:
 * - Use 'Meta' in keys to render ⌘ on Mac and Ctrl on other platforms.
 * - The component is presentational; it does not handle actual key binding.
 *
 * Example:
 *   <KeyShortcut description="Command Palette" keys={['Meta', 'K']} />
 */
export default function KeyShortcut({
  keys = [],
  description,
  size = 'md',
  separator = '+',
  className,
}) {
  const displayKeys = keys.map((k) => formatDisplayKey(k));
  const ariaKeys = keys.map((k) => formatAriaKey(k));

  const ariaLabel = `${description ? description + ': ' : ''}${ariaKeys.join(
    ` ${separator} `,
  )}`;

  return (
    <Container className={className} aria-label={ariaLabel} $size={size}>
      {description && <Description $size={size}>{description}</Description>}
      {displayKeys.map((k, idx) => (
        <React.Fragment key={`${k}-${idx}`}>
          <KeyCap $size={size}>{k}</KeyCap>
          {idx < displayKeys.length - 1 && (
            <Plus $size={size}>{separator}</Plus>
          )}
        </React.Fragment>
      ))}
    </Container>
  );
}
