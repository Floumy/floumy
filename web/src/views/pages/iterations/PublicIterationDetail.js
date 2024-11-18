import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from "reactstrap";
import { sortByPriority } from "../../../services/utils/utils";
import ExecutionStats from "../components/stats/ExecutionStats";
import PublicWorkItemsListCard from "../backlog/PublicWorkItemsListCard";
import PublicShareButtons from "../../../components/PublicShareButtons/PublicShareButtons";

function PublicIterationDetail(
  {
    orgId,
    iteration = {
      id: "",
      goal: "",
      startDate: "",
      duration: 2
    }
  }
) {
  const [workItems, setWorkItems] = useState([]);

  useEffect(() => {
    document.title = "Floumy | Sprint";

    if (iteration.id) {
      setWorkItems(sortByPriority(iteration.workItems));
    }
  }, [iteration]);

  function getDisplayDuration(duration) {
    return duration + " week" + (duration > 1 ? "s" : "");
  }

  return (
    <>
      {workItems && workItems.length > 0 && <ExecutionStats workItems={workItems} dueDate={iteration?.endDate} />}
      <Card>
        <CardHeader>
          <h3 className="mb-0"><span className="mr-2">{iteration.title}</span>
            {iteration.status === "active" && <span className="badge badge-info">Active</span>}
            {iteration.status === "completed" && <span className="badge badge-success">Completed</span>}
            {iteration.status === "planned" &&
              <span className="badge badge-primary text-white">Planned</span>}
          </h3>
          {iteration && <div className="py-2"><PublicShareButtons title={iteration.title} /></div>}
        </CardHeader>
        <CardBody>
          <Row>
            <Col className="mb-3" md="12">
              <label
                className="form-control-label">
                Goal
              </label>
              <Input
                disabled={true}
                className="bg-white"
                id="goal"
                name="goal"
                type="text"
                value={iteration.goal}
              />
            </Col>
          </Row>
          <Row>
            <Col>
              <label
                className="form-control-label"
              >
                Start Date
              </label>
              <Input
                disabled={true}
                className="bg-white"
                type="text"
                value={iteration.startDate} />
            </Col>
            <Col>
              <FormGroup>
                <label
                  className="form-control-label"
                >
                  Duration
                </label>
                <Input
                  type="text"
                  name="duration"
                  className="bg-white"
                  disabled={true}
                  value={getDisplayDuration(iteration.duration)} />
              </FormGroup>
            </Col>
          </Row>
        </CardBody>
      </Card>
      {iteration && workItems && <PublicWorkItemsListCard
        orgId={orgId}
        title={"Work Items"}
        workItems={workItems}
      />}
    </>
  );
}

export default PublicIterationDetail;
