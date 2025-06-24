import React from 'react';
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap';
import PropTypes from 'prop-types';

function DeleteConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  itemCount,
  itemType = 'items',
}) {
  const handleConfirm = () => {
    onConfirm();
  };

  const itemTypeDisplay = itemCount === 1 ? itemType.slice(0, -1) : itemType;
  const itemCountText = itemCount === 1 ? 'this' : `these ${itemCount}`;

  return (
    <Modal
      className="modal-dialog-centered modal-danger"
      isOpen={isOpen}
      toggle={onClose}
      centered
      fade={false}
      contentClassName="bg-danger"
    >
      <ModalHeader toggle={onClose} className="text-danger">
        Confirm Deletion
      </ModalHeader>
      <ModalBody>
        <div className="py-3 text-center">
          <i className="ni ni-check-bold ni-3x" />
          <h4 className="heading mt-4">
            Are you sure you want to delete {itemCountText} {itemTypeDisplay}?
          </h4>
          <p>This action cannot be undone.</p>
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="secondary"
          onClick={handleConfirm}
          disabled={isLoading}
          className="pull-left"
        >
          {isLoading ? 'Deleting...' : `Delete ${itemTypeDisplay}`}
        </Button>
        <Button
          className="text-white ml-auto"
          color="link"
          data-dismiss="modal"
          onClick={onClose}
          disabled={isLoading}
        >
          Cancel
        </Button>
      </ModalFooter>
    </Modal>
  );
}

DeleteConfirmationDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  itemCount: PropTypes.number.isRequired,
  itemType: PropTypes.string,
};

export default DeleteConfirmationDialog;
