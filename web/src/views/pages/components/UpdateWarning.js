import React, { useEffect, useState } from "react";
import { Button, Modal } from "reactstrap";

function UpdateWarning({ isOpen, warningMessage, entity, toggle, onUpdate }) {
  const [modal, setModal] = useState(isOpen);
  const [isUpdating, setIsUpdating] = useState(false);

  function toggleModal() {
    setModal(!modal);
    toggle();
  }

  useEffect(() => {
    setModal(isOpen);
  }, [isOpen]);

  async function handleUpdate() {
    setIsUpdating(true);
    await onUpdate();
    setIsUpdating(false);
  }

  return (
    <>
      <Modal
        className="modal-dialog-centered modal-danger"
        contentClassName="bg-warning"
        isOpen={modal}
        toggle={() => toggleModal()}
        centered={true}
        fade={false}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Confirm Update
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
            <h4 className="heading mt-4">Are you sure you want to update this {entity}?</h4>
            <p>
              {warningMessage}
            </p>
          </div>
        </div>
        <div className="modal-footer">
          <Button className="btn-white" color="default" type="button" onClick={handleUpdate} disabled={isUpdating}>
            {isUpdating ? <>
              Updating...
            </> : "Update"}
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

export default UpdateWarning;
