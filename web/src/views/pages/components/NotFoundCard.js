import { Card, CardBody } from 'reactstrap';
import React from 'react';

function NotFoundCard({ message }) {
  return (
    <Card>
      <CardBody>
        <div className="text-center text-lg">{message}</div>
      </CardBody>
    </Card>
  );
}

export default NotFoundCard;
