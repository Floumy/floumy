function ManageSubscription({
  paymentPlan,
  nextPaymentDate,
  onCancelSubscription,
  onSwitchPaymentPlan,
}) {
  function formatPaymentPlan(paymentPlan) {
    switch (paymentPlan) {
      case 'trial':
        return 'Trial';
      case 'build-in-private':
        return 'Build in Private';
      case 'build-in-public':
        return 'Build in Public';
      case 'free':
        return 'Free';
      default:
        return 'Unknown';
    }
  }

  function getPrice(paymentPlan) {
    switch (paymentPlan) {
      case 'trial':
        return 'Free';
      case 'build-in-private':
        return '$8 per user/month';
      case 'build-in-public':
        return '$10 per user/month';
      case 'free':
        return 'Free';
      default:
        return 'Unknown';
    }
  }

  return (
    <>
      <div className="mb-5 card">
        <div className="card-header">
          <div className="row">
            <div className="col-12 col-md-12">
              <h2 className="mb-3 card-title">Manage Your Subscription</h2>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-md-12">
              <h3 className="mb-3">Your subscription is active</h3>
              <p className="mb-3">
                Your subscription is active and will automatically renew on{' '}
                <strong>{nextPaymentDate.toLocaleDateString()}</strong>.
              </p>
            </div>
          </div>
          <div className="row">
            <div className="col-12 col-md-12">
              <h3 className="mb-3">Payment Plan</h3>
              <p className="mb-3">
                You are currently on the{' '}
                <strong>{formatPaymentPlan(paymentPlan)}</strong> plan that
                costs <strong>{getPrice(paymentPlan)}</strong>.
              </p>
              <button
                className="btn btn-primary mr-3 mb-3 ml-0"
                onClick={onSwitchPaymentPlan}
                type="button"
              >
                {paymentPlan === 'build-in-private'
                  ? `Switch to Build in Public for ${getPrice('build-in-public')}`
                  : `Switch to Build in Private (${getPrice('build-in-private')})`}
              </button>
              <button
                className="btn btn-danger mb-3 ml-0"
                onClick={onCancelSubscription}
                type="button"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ManageSubscription;
