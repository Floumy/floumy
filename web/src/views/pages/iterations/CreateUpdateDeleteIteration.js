import React, { useEffect, useState } from "react";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import { Button, Card, CardBody, CardHeader, Col, FormGroup, Input, Row } from "reactstrap";
import { Field, Form, Formik } from "formik";
import InputError from "../../../components/Errors/InputError";
import ReactDatetime from "react-datetime";
import Select2 from "react-select2-wrapper";
import { deleteIteration, startIteration } from "../../../services/iterations/iterations.service";
import DeleteWarning from "../components/DeleteWarning";
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from "react-toastify";
import WorkItemsListCard from "../backlog/WorkItemsListCard";
import { addWorkItem } from "../../../services/backlog/backlog.service";
import { sortByPriority } from "../../../services/utils/utils";
import ExecutionStats from "../components/stats/ExecutionStats";

function CreateUpdateDeleteIteration(
  {
    onSubmit,
    iteration = {
      id: "",
      goal: "",
      startDate: "",
      duration: 2
    }
  }
) {
  const { orgId, projectId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(iteration?.startDate);
  const [isStartDateTouched, setIsStartDateTouched] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(iteration?.duration);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [workItems, setWorkItems] = useState([]);
  const [iterationStatus, setIterationStatus] = useState(iteration?.status);

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      if (startDate === "") {
        setIsStartDateTouched(true);
        return;
      }
      setIsSubmitting(true);
      setIsStartDateTouched(false);
      await onSubmit({
        goal: values.goal,
        startDate,
        duration
      });
      navigate(-1);
      setTimeout(() => toast.success("The sprint has been saved"), 100);
    } catch (e) {
      toast.error("The sprint could not be saved");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Floumy | Sprint";

    if (iteration.id) {
      setIsUpdate(true);
      setWorkItems(sortByPriority(iteration.workItems));
    }
  }, [iteration]);

  function getDueDateClassName() {
    if (isStartDateTouched && startDate === "") {
      return "form-control is-invalid";
    }
    return "form-control ";
  }

  const onDelete = async (id) => {
    try {
      await deleteIteration(id);
      navigate(-1);
      setTimeout(() => toast.success("The sprint has been deleted"), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error("The sprint could not be deleted");
    }
  };

  function isDate(value) {
    return value && typeof value.format === "function";
  }

  function onChangeStartDate(value) {
    if (isDate(value)) {
      setStartDate(value.format("YYYY-MM-DD"));
      setIsStartDateTouched(true);
      return;
    }

    setStartDate("");
    setIsStartDateTouched(true);
  }

  async function handleAddWorkItem(workItem) {
    workItem.iteration = iteration.id;
    const savedWorkItem = await addWorkItem(workItem);
    setWorkItems([...workItems, savedWorkItem]);
  }

  function handleChangeIteration(workItems, newIterationId) {
    if (iteration.id === newIterationId) return;
    removeWorkItemFromIteration(workItems);
  }

  function removeWorkItemFromIteration(workItems) {
    const newWorkItems = [];
    workItems.forEach(workItem => {
      if (!workItems.some(w => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    setWorkItems(newWorkItems);
  }

  function updateWorkItemsStatusAndCompletedAt(updatedWorkItems, status) {
    const newWorkItems = workItems.map(workItem => {
      if (updatedWorkItems.some(w => w.id === workItem.id)) {
        workItem.status = status;
        workItem.completedAt = null;
        if (status === "done" || status === "closed") {
          workItem.completedAt = new Date().toISOString();
        }
      }
      return workItem;
    });
    setWorkItems(newWorkItems);
  }

  function updateWorkItemsPriority(updatedWorkItems, priority) {
    const workItemsToUpdate = [];
    for (const workItem of workItems) {
      if (updatedWorkItems.some(w => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      workItemsToUpdate.push(workItem);
    }
    setWorkItems(sortByPriority(workItemsToUpdate));
  }

  async function start(iterationId) {
    try {
      await startIteration(iterationId);
      setIterationStatus("active");
      toast.success("The sprint has been started");
    } catch (e) {
      toast.error("The sprint could not be started");
    }
  }

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={"sprint"}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => onDelete(iteration.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      {workItems && workItems.length > 0 && <ExecutionStats workItems={workItems} dueDate={iteration?.endDate} />}
      <Card>
        <CardHeader>
          {isUpdate && <h3 className="mb-0"><span className="mr-2">Edit {iteration.title}</span>
            {iterationStatus === "active" && <span className="badge badge-info">Active</span>}
            {iterationStatus === "completed" && <span className="badge badge-success">Completed</span>}
            {iterationStatus === "planned" &&
              <button onClick={async () => {
                await start(orgId, projectId, iteration.id);
              }} className="btn btn-sm btn-outline-primary mr-0">Start Sprint
              </button>}
          </h3>}

          {!isUpdate && <h3 className="mb-0">New Sprint</h3>}
        </CardHeader>
        <CardBody>
          <Formik
            initialValues={{ goal: iteration?.goal }}
            onSubmit={handleSubmit}
          >
            {({ values, handleChange }) => (
              <Form
                className="needs-validation"
                noValidate>
                <Row>
                  <Col className="mb-3" md="12">
                    <label
                      className="form-control-label">
                      Goal
                    </label>
                    <Field
                      as={Input}
                      id="goal"
                      name="goal"
                      placeholder="What is the goal of this sprint?"
                      type="text"
                      value={values.goal}
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Start Date
                      </label>
                      <ReactDatetime
                        inputProps={{
                          placeholder: "When does this sprint start?",
                          className: getDueDateClassName()
                        }}
                        closeOnSelect={true}
                        timeFormat={false}
                        dateFormat={"YYYY-MM-DD"}
                        value={startDate}
                        onChange={(value) => onChangeStartDate(value)}
                      />
                      {isStartDateTouched && startDate === "" &&
                        <InputError>
                          The start date is required
                        </InputError>
                      }
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <label
                        className="form-control-label"
                      >
                        Duration
                      </label>
                      <Select2
                        className="form-control"
                        defaultValue={"2"}
                        data={[
                          { id: "1", text: "One week" },
                          { id: "2", text: "Two weeks" },
                          { id: "3", text: "Three weeks" },
                          { id: "4", text: "Four weeks" }
                        ]}
                        options={{
                          placeholder: "How long is this sprint?"
                        }}
                        value={duration}
                        onSelect={(e) => setDuration(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Button
                  id={"save-iteration"}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Sprint
                </Button>
                {isUpdate && <Button
                  id={"delete-iteration"}
                  color="secondary"
                  type="button"
                  className="mt-3"
                  onClick={() => setIsDeleteWarningOpen(true)}
                  disabled={isSubmitting}
                >
                  Delete Sprint
                </Button>}
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
      {isUpdate && iteration && workItems && <WorkItemsListCard
        title={"Work Items"}
        workItems={workItems}
        onAddWorkItem={handleAddWorkItem}
        onChangeIteration={handleChangeIteration}
        onChangeStatus={updateWorkItemsStatusAndCompletedAt}
        onChangePriority={updateWorkItemsPriority}
      />}
    </>
  );
}

export default CreateUpdateDeleteIteration;
