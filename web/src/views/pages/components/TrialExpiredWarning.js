import { Button, Modal } from 'reactstrap';
import React, { useState } from 'react';

export default function TrialExpiredWarning() {
  const [isOpen, setIsOpen] = useState(true);

  function toggleModal() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <Modal
        className="modal-dialog-centered modal-warning"
        contentClassName="bg-blue"
        isOpen={isOpen}
        toggle={() => toggleModal()}
        centered={true}
        fade={false}
        backdrop={true}
      >
        <div className="modal-header">
          <h6 className="modal-title" id="modal-title-notification">
            Trial Expired
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
            <i className="ni ni-calendar-grid-58 ni-3x" />
            <h4 className="heading mt-4">Your Trial Has Ended</h4>
            <p>
              Your 7-day free trial has expired. To continue enjoying our
              awesome service, please upgrade your plan.
            </p>
          </div>
        </div>
        <div className="modal-footer align-content-center">
          <Button
            className="ml-auto mx-auto"
            color="secondary"
            data-dismiss="modal"
            type="button"
            onClick={() => toggleModal()}
          >
            OK
          </Button>
        </div>
      </Modal>
    </>
  );
}
