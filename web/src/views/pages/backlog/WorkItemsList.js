import { Badge, Button, Col, Input, Row, Table, UncontrolledTooltip } from "reactstrap";
import {
  formatHyphenatedString,
  memberNameInitials,
  priorityColor,
  textToColor,
  workItemStatusColorClassName,
  workItemTypeIcon
} from "../../../services/utils/utils";
import { Link, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import Select2 from "react-select2-wrapper";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import "react-contexify/ReactContexify.css";
import { useContextMenu } from "react-contexify";
import WorkItemsContextMenu from "../../../components/ContextMenu/WorkItemsContextMenu";
import { toast } from "react-toastify";

function WorkItemsList({
                         workItems,
                         showInitiative = true,
                         showAssignedTo = false,
                         headerClassName = "thead-light",
                         onAddNewWorkItem,
                         onChangeSprint,
                         onChangeStatus,
                         onChangePriority,
                         onChangeAssignee,
                         onChange,
                         enableContextMenu = true,
                         id = "work-items-context-menu"
                       }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState("user-story");
  const [priority, setPriority] = useState("medium");
  const [selectedWorkItems, setSelectedWorkItems] = useState([]);
  const [lastSelectedWorkItem, setLastSelectedWorkItem] = useState(null);
  const { show } = useContextMenu({ id });
  const { orgId, projectId } = useParams();

  function handleContextMenu(event, workItem) {
    if (!enableContextMenu) {
      event.preventDefault();
      return;
    }

    // If work item is not selected, select it and deselect all others
    let contextMenuSelectedWorkItems = [...selectedWorkItems];
    if (!contextMenuSelectedWorkItems.includes(workItem.id)) {
      contextMenuSelectedWorkItems = [workItem.id];
      setSelectedWorkItems(contextMenuSelectedWorkItems);
      // set index of row to be used for shift+click
      setLastSelectedWorkItem([workItems.findIndex(wi => wi.id === workItem.id)]);
    }

    const contextMenuWorkItems = contextMenuSelectedWorkItems.length > 0 ? workItems.filter(workItem => contextMenuSelectedWorkItems.includes(workItem.id)) : [workItem];
    show({
      event, props: { workItems: contextMenuWorkItems }
    });
  }

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required"), estimation: Yup.number()
      .nullable()
      .positive("The estimation must be a positive number")
      .typeError("The estimation must be a number")
  });

  async function handleSubmit(values) {
    try {
      toast.success("The work item has been added");
      setIsSubmitting(true);
      const workItem = {
        title: values.title,
        description: "",
        priority: priority,
        type: type,
        initiative: null,
        sprint: null,
        estimation: values.estimation ? values.estimation : null,
        status: "planned"
      };
      await onAddNewWorkItem(workItem);
      setType("user-story");
      setPriority("medium");
    } catch (e) {
      toast.error("The work item could not be saved");
      console.error("The work item could not be saved");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleRowClick = (workItemId, index, event) => {
    if (!enableContextMenu) {
      event.preventDefault();
      return;
    }

    let newSelectedWorkItems;

    if (event.shiftKey && lastSelectedWorkItem !== null) {
      const [startIndex, endIndex] = [Math.min(index, lastSelectedWorkItem), Math.max(index, lastSelectedWorkItem)];
      const rowsToToggle = workItems.slice(startIndex, endIndex + 1).map(row => row.id);

      const shouldSelect = !selectedWorkItems.includes(workItemId);
      newSelectedWorkItems = selectedWorkItems.filter(id => !rowsToToggle.includes(id));

      if (shouldSelect) {
        newSelectedWorkItems = [...new Set([...newSelectedWorkItems, ...rowsToToggle])];
      }
    } else {
      newSelectedWorkItems = selectedWorkItems.includes(workItemId)
        ? selectedWorkItems.filter(id => id !== workItemId)
        : [...selectedWorkItems, workItemId];
    }

    setSelectedWorkItems(newSelectedWorkItems);
    setLastSelectedWorkItem(index);
  };


  function handleChange(workItemIds, changes) {
    setSelectedWorkItems([]);
    if (onChange) {
      onChange(workItemIds, changes);
    }
  }

  useEffect(() => {
    setSelectedWorkItems([]);
  }, [workItems]);

  return (<>
    {enableContextMenu && <WorkItemsContextMenu
      menuId={id}
      onChangeSprint={onChangeSprint}
      onChangeStatus={onChangeStatus}
      onChangePriority={onChangePriority}
      onChangeAssignee={onChangeAssignee}
      onChange={handleChange} />}
    <div className="table-responsive">
      <Table className="align-items-center table-flush border-bottom no-select" style={{ minWidth: "700px" }}>
        <thead className={headerClassName}>
        <tr>
          <th scope="col" width={"5%"}>Reference</th>
          <th scope="col" width={"40%"}>Work Item</th>
          {showInitiative && <th scope="col" width={"30%"}>Initiative</th>}
          {showAssignedTo && <th scope="col" width={"5%"}>Assigned To</th>}
          <th scope="col" width={"5%"}>Est.</th>
          <th scope="col" width={"10%"}>Status</th>
          <th scope="col" width={"5%"}>Priority</th>
        </tr>
        </thead>
        <tbody className="list">
        {workItems.length === 0 && (<tr>
          <td colSpan={showInitiative ? 7 : 6} className="text-center">
            No work items found.
          </td>
        </tr>)}
        {workItems.map((workItem, index) => (<tr key={workItem.id}
                                                 onClick={(e) => handleRowClick(workItem.id, index, e)}
                                                 onContextMenu={(e) => {
                                                   handleContextMenu(e, workItem);
                                                 }}
                                                 className={selectedWorkItems.includes(workItem.id) ? "selected-row" : ""}
        >
          <td>
            <Link className={"edit-work-item"} color={"muted"}
                  to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${workItem.id}`}>
              {workItem.reference}
            </Link>
          </td>
          <td className={"title-cell"}>{workItemTypeIcon(workItem.type)}
            <Link className={"edit-work-item"} color={"muted"}
                  to={`/admin/orgs/${orgId}/projects/${projectId}/work-item/edit/${workItem.id}`}>
              {workItem.title}
            </Link>
          </td>
          {showInitiative && <td className="title-cell">
            {workItem.initiative && (
              <Link to={`/admin/orgs/${orgId}/projects/${projectId}/roadmap/initiatives/detail/${workItem.initiative.id}`}
                    className="text-gray">
                {workItem.initiative.title}
              </Link>)}
            {!workItem.initiative && "-"}
          </td>}
          {showAssignedTo && <td>
            {workItem.assignedTo && workItem.assignedTo.name &&
              <>
                <UncontrolledTooltip target={"assigned-to-" + workItem.id} placement="top">
                  {workItem.assignedTo.name}
                </UncontrolledTooltip>
                <span
                  className="avatar avatar-xs rounded-circle"
                  style={{ backgroundColor: textToColor(workItem.assignedTo.name) }}
                  id={"assigned-to-" + workItem.id}>{memberNameInitials(workItem.assignedTo.name)}
                </span>
              </>}
            {!workItem.assignedTo && "-"}
          </td>}
          <td>
            {workItem.estimation && workItem.estimation > 0 ? workItem.estimation : "-"}
          </td>
          <td>
            <Badge color="" className="badge-dot mr-4">
              <i className={workItemStatusColorClassName(workItem.status)} />
              <span className="status">{formatHyphenatedString(workItem.status)}</span>
            </Badge>
          </td>
          <td>
            <Badge color={priorityColor(workItem.priority)} pill={true}>
              {workItem.priority}
            </Badge>
          </td>
        </tr>))}
        {onAddNewWorkItem && <tr>
          <td colSpan={showInitiative ? 7 : 6}>
            <Formik
              initialValues={{ title: "", estimation: "" }}
              validationSchema={validationSchema}
              onSubmit={async (values, { resetForm }) => {
                await handleSubmit(values);
                resetForm();
              }}
            >
              {({ values, handleChange, errors, touched }) => (<Form
                className="needs-validation"
                noValidate>
                <Row>
                  <Col xs={2}>
                    <Select2
                      className="react-select-container"
                      defaultValue={type}
                      name="type"
                      data={[{ id: "user-story", text: "User Story" }, { id: "task", text: "Task" }, {
                        id: "bug",
                        text: "Bug"
                      }, { id: "spike", text: "Spike" }, { id: "technical-debt", text: "Technical Debt" }]}
                      onChange={(e) => setType(e.target.value)}></Select2>
                  </Col>
                  <Col xs={4}>

                    <Field
                      as={Input}
                      id="title"
                      name="title"
                      placeholder="What is this work item about?"
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
                      data={[{ id: "high", text: "High" }, { id: "medium", text: "Medium" }, {
                        id: "low",
                        text: "Low"
                      }]}
                      onChange={(e) => setPriority(e.target.value)}></Select2>
                  </Col>
                  <Col xs={2}>
                    <Field
                      as={Input}
                      id="estimation"
                      name="estimation"
                      placeholder="Estimation"
                      type="text"
                      value={values.estimation}
                      onChange={handleChange}
                      invalid={!!(errors.estimation && touched.estimation)}
                      autoComplete="off"
                    />
                  </Col>
                  <Col xs={2} className="text-right">
                    <Button
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
      </Table>
    </div>
  </>);
}

export default WorkItemsList;
