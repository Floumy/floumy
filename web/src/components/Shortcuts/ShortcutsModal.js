import React, { useEffect } from 'react';
import { Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ShortcutsList } from './index';

/**
 * ShortcutsModal
 * Shows a list of available keyboard shortcuts.
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - items: Array<{ description: string; keys: string[]; id?: string }>
 */
export default function ShortcutsModal({ isOpen, onClose, items = [] }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handler);
    }
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <Modal isOpen={isOpen} toggle={onClose} centered fade={false}>
      <ModalHeader toggle={onClose}>Keyboard Shortcuts</ModalHeader>
      <ModalBody>
        <p className="text-muted mb-3">
          You can use these shortcuts to quickly navigate within the project.
        </p>
        <ShortcutsList items={items} />
      </ModalBody>
    </Modal>
  );
}
