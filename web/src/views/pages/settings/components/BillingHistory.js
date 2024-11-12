import React from "react";

function BillingHistory({ invoices = [] }) {
  return (
    <div className="mb-5 card">
      <div className="card-header">
        <div className="row">
          <div className="col-12 col-md-12"><h2 className="mb-3 card-title">Billing History</h2></div>
        </div>
      </div>
      {invoices.length > 0 && <table className="table table-striped">
        <thead>
        <tr>
          <th scope="col">Invoice</th>
          <th scope="col">Date</th>
        </tr>
        </thead>
        <tbody>
        {invoices.map((invoice) => (
          <tr key={invoice.id}>
            <td><a href={invoice.pdf}>Download Invoice</a></td>
            <td>{new Date(invoice.createdAt).toLocaleDateString()} {new Date(invoice.createdAt).toLocaleTimeString()}</td>
          </tr>
        ))}
        </tbody>
      </table>}
      {invoices.length === 0 && <div className="card-body">
        <div className="row">
          <div className="col-12 col-md-12">
            <h3 className="mb-3">Your billing history is empty</h3>
            <p className="mb-3">
              Your billing history will appear here once you have made a payment.
            </p>
          </div>
        </div>
      </div>}
    </div>
  );
}

export default BillingHistory;
