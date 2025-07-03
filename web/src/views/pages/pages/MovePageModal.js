import React, { useState } from 'react';
import { Modal, Button, FormGroup, Label, Input } from 'reactstrap';

/**
 * Props:
 * - isOpen: boolean
 * - toggle: function
 * - onMove: function(newParentId)
 * - pageTree: array (tree of pages)
 * - currentParentId: string
 */
export default function MovePageModal({
  isOpen,
  toggle,
  onMove,
  pageTree,
  currentParentId,
  idToMove,
}) {
  const [selectedParent, setSelectedParent] = useState(currentParentId || '');

  const renderOptions = (nodes, prefix = '') => {
    return nodes.map((node) =>
      node.id !== idToMove
        ? [
            <option
              key={node.id}
              value={node.id}
              disabled={node.id === currentParentId}
            >
              {prefix + node.title}
            </option>,
            node.children ? renderOptions(node.children, prefix + '— ') : null,
          ]
        : undefined,
    );
  };

  const handleMove = () => {
    if (selectedParent !== currentParentId) {
      onMove(selectedParent || null);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <div className="modal-header">
        <h5 className="modal-title">Move Page</h5>
        <button type="button" className="close" onClick={toggle}>
          &times;
        </button>
      </div>
      <div className="modal-body">
        <FormGroup>
          <Label for="parentSelect">Select new parent page</Label>
          <Input
            type="select"
            id="parentSelect"
            value={selectedParent}
            onChange={(e) => setSelectedParent(e.target.value)}
          >
            <option value="">Root</option>
            {renderOptions(pageTree)}
          </Input>
        </FormGroup>
      </div>
      <div className="modal-footer">
        <Button color="secondary" onClick={toggle}>
          Cancel
        </Button>
        <Button
          color="primary"
          onClick={handleMove}
          disabled={selectedParent === currentParentId}
        >
          Move Page
        </Button>
      </div>
    </Modal>
  );
}
