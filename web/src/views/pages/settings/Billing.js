import SimpleHeader from "../../../components/Headers/SimpleHeader";
import { Col, Container, Row } from "reactstrap";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import TrialExpiredWarning from "../components/TrialExpiredWarning";
import { setCurrentOrg } from "../../../services/org/orgs.service";
import Pricing from "./components/Pricing";
import ManageSubscription from "./components/ManageSubscription";
import { cancelSubscription, getInvoices, updateSubscription } from "../../../services/payments/payments.service";
import BillingHistory from "./components/BillingHistory";
import { toast } from "react-toastify";

function Billing() {
  const [searchParams] = useSearchParams();
  const isExpired = searchParams.get("expired");
  const [paymentPlan, setPaymentPlan] = React.useState("");
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [nextPaymentDate, setNextPaymentDate] = React.useState(null);
  const [invoices, setInvoices] = useState([]);
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);
  const [isLoadingOrg, setIsLoadingOrg] = useState(false);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setIsLoadingInvoices(true);
        const invoices = await getInvoices();
        setInvoices(invoices);
      } catch (e) {
        toast.error("Failed to fetch invoices");
      } finally {
        setIsLoadingInvoices(false);
      }
    };

    if (paymentPlan !== "trial") {
      fetchInvoices();
    }
  }, [paymentPlan]);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoadingOrg(true);
        await setCurrentOrg();
        setPaymentPlan(localStorage.getItem("paymentPlan"));
        setIsSubscribed(localStorage.getItem("isSubscribed") === "true");
        setNextPaymentDate(new Date(localStorage.getItem("nextPaymentDate")));
      } catch (e) {
        toast.error("Failed to fetch subscription data");
      } finally {
        setIsLoadingOrg(false);
      }
    }

    fetchData();
  }, []);

  async function handleCancelSubscription() {
    await cancelSubscription();
    setIsSubscribed(false);
  }

  async function handleSwitchPaymentPlan() {
    await updateSubscription(paymentPlan === "build-in-private" ? "build-in-public" : "build-in-private");
    setPaymentPlan(paymentPlan === "build-in-private" ? "build-in-public" : "build-in-private");
  }

  return (
    <>
      {isExpired && paymentPlan === "trial" && <TrialExpiredWarning />}
      <SimpleHeader />
      <Container className="mt--6 pb-4" fluid>
        <Row className="justify-content-center">
          <Col>
            {!isLoadingOrg && ((!isSubscribed && nextPaymentDate < new Date()) || paymentPlan === "trial") &&
              <Pricing />}
            {isSubscribed &&
              <ManageSubscription
                paymentPlan={paymentPlan}
                nextPaymentDate={nextPaymentDate}
                onCancelSubscription={handleCancelSubscription}
                onSwitchPaymentPlan={handleSwitchPaymentPlan} />}
          </Col>
        </Row>
        {paymentPlan !== "trial" && !isLoadingInvoices && <Row>
          <Col>
            <BillingHistory invoices={invoices} />
          </Col>
        </Row>}
      </Container>
    </>
  );
}

export default Billing;
