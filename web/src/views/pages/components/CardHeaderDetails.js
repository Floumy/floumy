import { formatDateWithTime } from "../../../services/utils/utils";
import React from "react";

function CardHeaderDetails({ createdBy, createdAt, updatedAt }) {
  return (
    <>
      <div className="py-2">
        <p
          className="text-sm mb-0">Created {createdBy && (<>by <i>{createdBy.name}</i></>)} at <i>{formatDateWithTime(createdAt)}</i>
        </p>
        <p className="text-sm mb-0">Last updated at <i>{formatDateWithTime(updatedAt)}</i>
        </p>
      </div>
    </>
  );
}

export default CardHeaderDetails;
