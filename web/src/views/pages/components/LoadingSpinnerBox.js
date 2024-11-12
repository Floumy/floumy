import { Spinner } from "reactstrap";
import React from "react";

function LoadingSpinnerBox() {
  return (
    <div className="text-center p-5"><Spinner className="m-auto" color="primary" /></div>
  );
}

export default LoadingSpinnerBox;
