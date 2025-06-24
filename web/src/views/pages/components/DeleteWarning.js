import React, { useEffect, useState } from 'react';
import { Button, Modal } from 'reactstrap';

function DeleteWarning({ isOpen, entity, toggle, onDelete }) {
  const [modal, setModal] = useState(isOpen);
  const [isDeleting, setIsDeleting] = useState(false);

  function toggleModal() {
    setModal(!modal);
    toggle();
  }

  useEffect(() => {
    setModal(isOpen);
  }, [isOpen]);

  function handleDelete() {
    setIsDeleting(true);
    onDelete();
    setIsDeleting(false);
  }

  return (
    <>
      <Modal
        className="modal-dialog-centered modal-danger"
        contentClassName="bg-danger"
        isOpen={modal}
        toggle={() => toggleModal()}
        centered={true}
        fade={false}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Confirm Deletion
          </h6>
          <button
            aria-label="Close"
            className="close"
            data-dismiss="modal"
            type="button"
            onClick={() => toggleModal()}
          >
            <span aria-hidden={true}>×</span>
          </button>
        </div>
        <div className="modal-body">
          <div className="py-3 text-center">
            <i className="ni ni-check-bold ni-3x" />
            <h4 className="heading mt-4">
              Are you sure you want to delete this {entity}?
            </h4>
            <p>
              This action is irreversible and will permanently remove the{' '}
              {entity}. Please confirm your decision.
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button
            className="btn-white"
            color="default"
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <>Deleting...</> : 'Delete'}
          </Button>
          <Button
            className="text-white ml-auto"
            color="link"
            data-dismiss="modal"
            type="button"
            onClick={() => toggleModal()}
          >
            Close
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default DeleteWarning;
