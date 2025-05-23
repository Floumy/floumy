import { Link, useParams } from 'react-router-dom';
import { Badge, Button, Col, Input, Progress, Row, UncontrolledTooltip } from 'reactstrap';
import {
  formatHyphenatedString,
  formatProgress,
  initiativeStatusColorClassName,
  memberNameInitials,
  priorityColor,
  sortByPriority,
  textToColor,
} from '../../../services/utils/utils';
import React, { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { Field, Form, Formik } from 'formik';
import Select2 from 'react-select2-wrapper';
import InitiativesContextMenu from '../../../components/ContextMenu/InitiativesContextMenu';
import { useContextMenu } from 'react-contexify';
import { toast } from 'react-toastify';
import PropTypes from 'prop-types';

function InitiativesList({
                        initiatives,
                        headerClassName = "thead-light",
                        onAddInitiative,
                        id = "initiatives-context-menu",
                        onChangePriority,
                        onChangeStatus,
                        onChangeMilestone,
                        onChangeKeyResult,
                        onChangeAssignedTo,
                        onChange,
                        showAssignedTo = false,
                        enableContextMenu = true
                      }) {
  const { orgId, projectId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [sortedInitiatives, setSortedInitiatives] = useState([]);
  const [selectedInitiatives, setSelectedInitiatives] = useState([]);
  const [lastSelectedInitiative, setLastSelectedInitiative] = useState(null);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required")
  });

  useEffect(() => {
    const sortedInitiatives = sortByPriority(initiatives);
    setSortedInitiatives(sortedInitiatives);
  }, [initiatives]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const initiative = {
        title: values.title,
        priority: priority,
        status: "planned"
      };
      await onAddInitiative(initiative);
      setPriority("medium");
      setIsSubmitting(false);
      toast.success("The initiative has been added");
    } catch (e) {
      setIsSubmitting(false);
      toast.error("The initiative could not be saved");
    }
  };

  const { show } = useContextMenu({ id });

  function handleContextMenu(event, initiative) {
    if (!enableContextMenu) {
      event.preventDefault();
      return;
    }

    // If initiative is not selected, select it and deselect all others
    let contextMenuSelectedInitiatives = [...selectedInitiatives];
    if (!contextMenuSelectedInitiatives.includes(initiative.id)) {
      contextMenuSelectedInitiatives = [initiative.id];
      setSelectedInitiatives(contextMenuSelectedInitiatives);
      // Set index of row to be used for shift+click
      setLastSelectedInitiative([initiatives.findIndex(f => f.id === initiative.id)]);
    }

    const contextMenuInitiatives = contextMenuSelectedInitiatives.length > 0 ? initiatives.filter(initiative => contextMenuSelectedInitiatives.includes(initiative.id)) : [initiative];
    show({
      event, props: { initiatives: contextMenuInitiatives }
    });
  }

  const handleRowClick = (initiativeId, index, event) => {
    if (!enableContextMenu) {
      event.preventDefault();
      return;
    }

    let newSelectedInitiatives;

    if (event.shiftKey && lastSelectedInitiative !== null) {
      const [startIndex, endIndex] = [Math.min(index, lastSelectedInitiative), Math.max(index, lastSelectedInitiative)];
      const rowsToToggle = initiatives.slice(startIndex, endIndex + 1).map(row => row.id);

      const shouldSelect = !selectedInitiatives.includes(initiativeId);
      newSelectedInitiatives = selectedInitiatives.filter(id => !rowsToToggle.includes(id));

      if (shouldSelect) {
        newSelectedInitiatives = [...new Set([...newSelectedInitiatives, ...rowsToToggle])];
      }
    } else {
      newSelectedInitiatives = selectedInitiatives.includes(initiativeId)
        ? selectedInitiatives.filter(id => id !== initiativeId)
        : [...selectedInitiatives, initiativeId];
    }

    setSelectedInitiatives(newSelectedInitiatives);
    setLastSelectedInitiative(index);
  };

  function handleChange(initiative, changes) {
    setSelectedInitiatives([]);
    setLastSelectedInitiative(null);
    if (onChange) {
      onChange(initiative, changes);
    }
  }

  return (
    <>
      {enableContextMenu && <InitiativesContextMenu menuId={id} onChange={handleChange} onChangePriority={onChangePriority}
                                                    onChangeStatus={onChangeStatus} onChangeMilestone={onChangeMilestone}
                                                    onChangeKeyResult={onChangeKeyResult} onChangeAssignTo={onChangeAssignedTo}/>}
      <div className="table-responsive border-bottom">
        <table className="table align-items-center no-select" style={{ minWidth: "700px" }}>
          <thead className={headerClassName}>
          <tr>
            <th scope="col" width="5%">Reference</th>
            <th scope="col" width="40%">Initiative</th>
            <th scope="col" width="20%">Progress</th>
            <th scope="col" width="10%">Status</th>
            {showAssignedTo && <th scope="col" width={"10%"}>Assigned To</th>}
            <th scope="col" width="10%">Priority</th>
          </tr>
          </thead>
          <tbody className="list">
          {sortedInitiatives.length === 0 &&
            <tr>
              <td colSpan={6} className={"text-center"}>
                No initiatives found.
              </td>
            </tr>
          }
          {sortedInitiatives.map((initiative, index) => (
            <tr key={initiative.id}
                onClick={(e) => handleRowClick(initiative.id, index, e)}
                onContextMenu={(e) => {
                  handleContextMenu(e, initiative);
                }}
                className={selectedInitiatives.includes(initiative.id) ? "selected-row" : ""}>
              <td>
                <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${initiative.id}`}
                      className={"initiative-detail"}>
                  {initiative.reference}
                </Link>
              </td>
              <td className="title-cell">
                <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${initiative.id}`}
                      className={"initiative-detail"}>
                  {initiative.title}
                </Link>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="mr-2">{formatProgress(initiative.progress)}%</span>
                  <div>
                    <Progress style={{ maxWidth: "80px" }} max="100" value={initiative.progress} color="primary" />
                  </div>
                </div>
              </td>
              <td>
                <Badge color="" className="badge-dot mr-4">
                  <i className={initiativeStatusColorClassName(initiative.status)} />
                  <span className="status">{formatHyphenatedString(initiative.status)}</span>
                </Badge>
              </td>
              {showAssignedTo && <td>
                {initiative.assignedTo && initiative.assignedTo.name &&
                  <>
                    <UncontrolledTooltip target={"assigned-to-" + initiative.id} placement="top">
                      {initiative.assignedTo.name}
                    </UncontrolledTooltip>
                    <span
                      className="avatar avatar-xs rounded-circle"
                      style={{ backgroundColor: textToColor(initiative.assignedTo.name) }}
                      id={"assigned-to-" + initiative.id}>{memberNameInitials(initiative.assignedTo.name)}
                </span>
                  </>}
                {!initiative.assignedTo && "-"}
              </td>}
              <td>
                <Badge color={priorityColor(initiative.priority)} pill={true}>
                  {initiative.priority}
                </Badge>
              </td>
            </tr>
          ))}
          {onAddInitiative &&
            <tr>
              <td colSpan={7}>
                <Formik
                  initialValues={{ title: "" }}
                  validationSchema={validationSchema}
                  onSubmit={async (values, { resetForm }) => {
                    await handleSubmit(values);
                    resetForm();
                  }}
                >
                  {({ values, handleChange, errors, touched }) => (
                    <Form
                      className="needs-validation"
                      noValidate>
                      <Row>
                        <Col xs={8}>
                          <Field
                            as={Input}
                            id="title"
                            name="title"
                            placeholder="What do you want to create?"
                            type="text"
                            value={values.title}
                            onChange={handleChange}
                            invalid={!!(errors.title && touched.title)}
                            autoComplete="off"
                          />
                        </Col>
                        <Col xs={2}>
                          <Select2
                            className="react-select-container"
                            defaultValue={priority}
                            name="priority"
                            data={[
                              { id: "high", text: "High" },
                              { id: "medium", text: "Medium" },
                              { id: "low", text: "Low" }
                            ]}
                            onChange={(e) => setPriority(e.target.value)}></Select2>
                        </Col>
                        <Col xs={2} className="text-right">
                          <Button
                            id={"save-initiative"}
                            color="primary"
                            type="submit"
                            disabled={isSubmitting}
                          >
                            Add
                          </Button>
                        </Col>
                      </Row>
                    </Form>)}
                </Formik>
              </td>
            </tr>}
          </tbody>
        </table>
      </div>
    </>);
}

export default InitiativesList;

InitiativesList.propTypes = {
  initiatives: PropTypes.array.isRequired,
  onAddInitiative: PropTypes.func,
  onChangePriority: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChangeMilestone: PropTypes.func,
  onChangeKeyResult: PropTypes.func,
  onChangeAssignedTo: PropTypes.func,
  onChange: PropTypes.func,
  showAssignedTo: PropTypes.bool,
  enableContextMenu: PropTypes.bool,
  id: PropTypes.string,
  headerClassName: PropTypes.string
};