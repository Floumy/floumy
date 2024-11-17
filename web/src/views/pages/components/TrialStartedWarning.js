import { Button, Modal } from "reactstrap";
import React, { useState } from "react";

export default function TrialStartedWarning() {
  const [isOpen, setIsOpen] = useState(true);

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <Modal
        className="modal-dialog-centered modal-primary"
        contentClassName="bg-blue"
        isOpen={isOpen}
        toggle={() => toggleModal()}
        centered={true}
        fade={false}
        backdrop={true}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Welcome to Your Trial!
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
            <i className="ni ni-satisfied ni-3x" />
            <h4 className="heading mt-4">Enjoy Your 7-Day Free Trial</h4>
            <p>
              You’ve got 7 days to explore all the features. After that, upgrade to keep enjoying our awesome service.
              Have fun!
            </p>
          </div>
        </div>
        <div className="modal-footer align-content-center">
          <Button
            className="ml-auto mr-auto"
            data-dismiss="modal"
            type="button"
            onClick={() => toggleModal()}>
            Got it!
          </Button>
        </div>
      </Modal>
    </>
  );
}
