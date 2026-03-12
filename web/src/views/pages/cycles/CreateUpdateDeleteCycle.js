import React, { useEffect, useState } from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Col,
  FormGroup,
  Input,
  Row,
} from 'reactstrap';
import { Field, Form, Formik } from 'formik';
import InputError from '../../../components/Errors/InputError';
import ReactDatetime from 'react-datetime';
import Select2 from 'react-select2-wrapper';
import {
  deleteCycle,
  startCycle,
} from '../../../services/cycles/cycles.service';
import DeleteWarning from '../components/DeleteWarning';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import WorkItemsListCard from '../backlog/WorkItemsListCard';
import { addWorkItem } from '../../../services/backlog/backlog.service';
import { sortByPriority } from '../../../services/utils/utils';
import ExecutionStats from '../components/stats/ExecutionStats';

function CreateUpdateDeleteCycle({
  onSubmit,
  cycle = {
    id: '',
    goal: '',
    startDate: '',
    duration: 2,
  },
}) {
  const { orgId, projectId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState(cycle?.startDate);
  const [isStartDateTouched, setIsStartDateTouched] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(cycle?.duration);
  const [isDeleteWarningOpen, setIsDeleteWarningOpen] = useState(false);
  const [workItems, setWorkItems] = useState([]);
  const [cycleStatus, setCycleStatus] = useState(cycle?.status);

  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    try {
      setIsLoading(true);
      if (startDate === '') {
        setIsStartDateTouched(true);
        return;
      }
      setIsSubmitting(true);
      setIsStartDateTouched(false);
      const savedCycle = await onSubmit({
        goal: values.goal,
        startDate,
        duration,
      });

      setTimeout(() => toast.success('The cycle has been saved'), 100);

      if (!cycle.id) {
        navigate(
          `/admin/orgs/${orgId}/projects/${projectId}/cycles/edit/${savedCycle.id}`,
          { replace: true },
        );
      }
    } catch (e) {
      toast.error('The cycle could not be saved');
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Floumy | Cycle';

    if (cycle.id) {
      setIsUpdate(true);
      setWorkItems(sortByPriority(cycle.workItems));
    }
  }, [cycle]);

  function getDueDateClassName() {
    if (isStartDateTouched && startDate === '') {
      return 'form-control is-invalid';
    }
    return 'form-control ';
  }

  const onDelete = async (id) => {
    try {
      await deleteCycle(orgId, projectId, id);
      navigate(-1);
      setTimeout(() => toast.success('The cycle has been deleted'), 100);
    } catch (e) {
      setIsDeleteWarningOpen(false);
      toast.error('The cycle could not be deleted');
    }
  };

  function isDate(value) {
    return value && typeof value.format === 'function';
  }

  function onChangeStartDate(value) {
    if (isDate(value)) {
      setStartDate(value.format('YYYY-MM-DD'));
      setIsStartDateTouched(true);
      return;
    }

    setStartDate('');
    setIsStartDateTouched(true);
  }

  async function handleAddWorkItem(workItem) {
    workItem.cycle = cycle.id;
    const savedWorkItem = await addWorkItem(orgId, projectId, workItem);
    setWorkItems([...workItems, savedWorkItem]);
  }

  function handleChangeCycle(workItems, newCycleId) {
    if (cycle.id === newCycleId) return;
    removeWorkItemFromCycle(workItems);
  }

  function removeWorkItemFromCycle(workItems) {
    const newWorkItems = [];
    workItems.forEach((workItem) => {
      if (!workItems.some((w) => w.id === workItem.id)) {
        newWorkItems.push(workItem);
      }
    });
    setWorkItems(newWorkItems);
  }

  function updateWorkItemsStatusAndCompletedAt(updatedWorkItems, status) {
    const newWorkItems = workItems.map((workItem) => {
      if (updatedWorkItems.some((w) => w.id === workItem.id)) {
        workItem.status = status;
        workItem.completedAt = null;
        if (status === 'done' || status === 'closed') {
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
      if (updatedWorkItems.some((w) => w.id === workItem.id)) {
        workItem.priority = priority;
      }
      workItemsToUpdate.push(workItem);
    }
    setWorkItems(sortByPriority(workItemsToUpdate));
  }

  async function start(orgId, projectId, cycleId) {
    try {
      await startCycle(orgId, projectId, cycleId);
      setCycleStatus('active');
      toast.success('The cycle has been started');
    } catch (e) {
      toast.error('The cycle could not be started');
    }
  }

  return (
    <>
      <DeleteWarning
        isOpen={isDeleteWarningOpen}
        entity={'cycle'}
        toggle={() => setIsDeleteWarningOpen(!isDeleteWarningOpen)}
        onDelete={() => onDelete(cycle.id)}
      />
      {isLoading && <InfiniteLoadingBar />}
      {workItems && workItems.length > 0 && (
        <ExecutionStats workItems={workItems} dueDate={cycle?.endDate} />
      )}
      <Card>
        <CardHeader>
          {isUpdate && (
            <h3 className="mb-0">
              <span className="mr-2">Edit {cycle.title}</span>
              {cycleStatus === 'active' && (
                <span className="badge badge-info">Active</span>
              )}
              {cycleStatus === 'completed' && (
                <span className="badge badge-success">Completed</span>
              )}
              {cycleStatus === 'planned' && (
                <button
                  onClick={async () => {
                    await start(orgId, projectId, cycle.id);
                  }}
                  className="btn btn-sm btn-outline-primary mr-0"
                >
                  Start Cycle
                </button>
              )}
            </h3>
          )}

          {!isUpdate && <h3 className="mb-0">New Cycle</h3>}
        </CardHeader>
        <CardBody>
          <Formik initialValues={{ goal: cycle?.goal }} onSubmit={handleSubmit}>
            {({ values, handleChange }) => (
              <Form className="needs-validation" noValidate>
                <Row>
                  <Col className="mb-3" md="12">
                    <label className="form-control-label">Goal</label>
                    <Field
                      as={Input}
                      id="goal"
                      name="goal"
                      placeholder="What is the goal of this cycle?"
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
                      <label className="form-control-label">Start Date</label>
                      <ReactDatetime
                        inputProps={{
                          placeholder: 'When does this cycle start?',
                          className: getDueDateClassName(),
                        }}
                        closeOnSelect={true}
                        timeFormat={false}
                        dateFormat={'YYYY-MM-DD'}
                        value={startDate}
                        onChange={(value) => onChangeStartDate(value)}
                      />
                      {isStartDateTouched && startDate === '' && (
                        <InputError>The start date is required</InputError>
                      )}
                    </FormGroup>
                  </Col>
                  <Col>
                    <FormGroup>
                      <label className="form-control-label">Duration</label>
                      <Select2
                        className="form-control"
                        defaultValue={'2'}
                        data={[
                          { id: '1', text: 'One week' },
                          { id: '2', text: 'Two weeks' },
                          { id: '3', text: 'Three weeks' },
                          { id: '4', text: 'Four weeks' },
                        ]}
                        options={{
                          placeholder: 'How long is this cycle?',
                        }}
                        value={duration}
                        onSelect={(e) => setDuration(e.target.value)}
                      />
                    </FormGroup>
                  </Col>
                </Row>
                <Button
                  id={'save-cycle'}
                  color="primary"
                  type="submit"
                  className="mt-3"
                  disabled={isSubmitting}
                >
                  Save Cycle
                </Button>
                {isUpdate && (
                  <Button
                    id={'delete-cycle'}
                    color="secondary"
                    type="button"
                    className="mt-3"
                    onClick={() => setIsDeleteWarningOpen(true)}
                    disabled={isSubmitting}
                  >
                    Delete Cycle
                  </Button>
                )}
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
      {isUpdate && cycle && workItems && (
        <WorkItemsListCard
          title={'Work Items'}
          workItems={workItems}
          onAddWorkItem={handleAddWorkItem}
          onChangeCycle={handleChangeCycle}
          onChangeStatus={updateWorkItemsStatusAndCompletedAt}
          onChangePriority={updateWorkItemsPriority}
        />
      )}
    </>
  );
}

export default CreateUpdateDeleteCycle;
