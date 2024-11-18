import { Link, useParams } from "react-router-dom";
import { Badge, Button, Col, Input, Progress, Row, UncontrolledTooltip } from "reactstrap";
import {
  featureStatusColorClassName,
  formatHyphenatedString,
  formatProgress,
  memberNameInitials,
  priorityColor,
  sortByPriority,
  textToColor
} from "../../../services/utils/utils";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { Field, Form, Formik } from "formik";
import Select2 from "react-select2-wrapper";
import FeaturesContextMenu from "../../../components/ContextMenu/FeaturesContextMenu";
import { useContextMenu } from "react-contexify";
import { toast } from "react-toastify";
import PropTypes from "prop-types";

function FeaturesList({
                        features,
                        headerClassName = "thead-light",
                        onAddFeature,
                        id = "features-context-menu",
                        onChangePriority,
                        onChangeStatus,
                        onChangeMilestone,
                        onChangeKeyResult,
                        onChange,
                        showAssignedTo = false,
                        enableContextMenu = true
                      }) {
  const { orgId, productId } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [priority, setPriority] = useState("medium");
  const [sortedFeatures, setSortedFeatures] = useState([]);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [lastSelectedFeature, setLastSelectedFeature] = useState(null);

  const validationSchema = Yup.object({
    title: Yup.string()
      .required("The title is required")
  });

  useEffect(() => {
    const sortedFeatures = sortByPriority(features);
    setSortedFeatures(sortedFeatures);
  }, [features]);

  const handleSubmit = async (values) => {
    try {
      setIsSubmitting(true);
      const feature = {
        title: values.title,
        priority: priority,
        status: "planned"
      };
      await onAddFeature(feature);
      setPriority("medium");
      setIsSubmitting(false);
      toast.success("The feature has been added");
    } catch (e) {
      setIsSubmitting(false);
      toast.error("The feature could not be saved");
    }
  };

  const { show } = useContextMenu({ id });

  function handleContextMenu(event, feature) {
    if (!enableContextMenu) {
      event.preventDefault();
      return;
    }

    // If feature is not selected, select it and deselect all others
    let contextMenuSelectedFeatures = [...selectedFeatures];
    if (!contextMenuSelectedFeatures.includes(feature.id)) {
      contextMenuSelectedFeatures = [feature.id];
      setSelectedFeatures(contextMenuSelectedFeatures);
      // Set index of row to be used for shift+click
      setLastSelectedFeature([features.findIndex(f => f.id === feature.id)]);
    }

    const contextMenuFeatures = contextMenuSelectedFeatures.length > 0 ? features.filter(feature => contextMenuSelectedFeatures.includes(feature.id)) : [feature];
    show({
      event, props: { features: contextMenuFeatures }
    });
  }

  const handleRowClick = (featureId, index, event) => {
    if (!enableContextMenu) {
      event.preventDefault();
      return;
    }

    let newSelectedFeatures;

    if (event.shiftKey && lastSelectedFeature !== null) {
      const [startIndex, endIndex] = [Math.min(index, lastSelectedFeature), Math.max(index, lastSelectedFeature)];
      const rowsToToggle = features.slice(startIndex, endIndex + 1).map(row => row.id);

      const shouldSelect = !selectedFeatures.includes(featureId);
      newSelectedFeatures = selectedFeatures.filter(id => !rowsToToggle.includes(id));

      if (shouldSelect) {
        newSelectedFeatures = [...new Set([...newSelectedFeatures, ...rowsToToggle])];
      }
    } else {
      newSelectedFeatures = selectedFeatures.includes(featureId)
        ? selectedFeatures.filter(id => id !== featureId)
        : [...selectedFeatures, featureId];
    }

    setSelectedFeatures(newSelectedFeatures);
    setLastSelectedFeature(index);
  };

  function handleChange(feature, changes) {
    setSelectedFeatures([]);
    setLastSelectedFeature(null);
    if (onChange) {
      onChange(feature, changes);
    }
  }

  return (
    <>
      {enableContextMenu && <FeaturesContextMenu menuId={id} onChange={handleChange} onChangePriority={onChangePriority}
                                                 onChangeStatus={onChangeStatus} onChangeMilestone={onChangeMilestone}
                                                 onChangeKeyResult={onChangeKeyResult} />}
      <div className="table-responsive border-bottom">
        <table className="table align-items-center no-select" style={{ minWidth: "700px" }}>
          <thead className={headerClassName}>
          <tr>
            <th scope="col" width="5%">Reference</th>
            <th scope="col" width="40%">Initiative</th>
            <th scope="col" width="20%">Progress</th>
            <th scope="col" width="5%">W.I. Count</th>
            <th scope="col" width="10%">Status</th>
            {showAssignedTo && <th scope="col" width={"10%"}>Assigned To</th>}
            <th scope="col" width="10%">Priority</th>
          </tr>
          </thead>
          <tbody className="list">
          {sortedFeatures.length === 0 &&
            <tr>
              <td colSpan={7} className={"text-center"}>
                No initiatives found.
              </td>
            </tr>
          }
          {sortedFeatures.map((feature, index) => (
            <tr key={feature.id}
                onClick={(e) => handleRowClick(feature.id, index, e)}
                onContextMenu={(e) => {
                  handleContextMenu(e, feature);
                }}
                className={selectedFeatures.includes(feature.id) ? "selected-row" : ""}>
              <td>
                <Link to={`/admin/orgs/${orgId}/products/${productId}/roadmap/features/detail/${feature.id}`}
                      className={"feature-detail"}>
                  {feature.reference}
                </Link>
              </td>
              <td className="title-cell">
                <Link to={`/admin/orgs/${orgId}/products/${productId}/roadmap/features/detail/${feature.id}`}
                      className={"feature-detail"}>
                  {feature.title}
                </Link>
              </td>
              <td>
                <div className="d-flex align-items-center">
                  <span className="mr-2">{formatProgress(feature.progress)}%</span>
                  <div>
                    <Progress style={{ maxWidth: "80px" }} max="100" value={feature.progress} color="primary" />
                  </div>
                </div>
              </td>
              <td>
                {feature.workItemsCount}
              </td>
              <td>
                <Badge color="" className="badge-dot mr-4">
                  <i className={featureStatusColorClassName(feature.status)} />
                  <span className="status">{formatHyphenatedString(feature.status)}</span>
                </Badge>
              </td>
              {showAssignedTo && <td>
                {feature.assignedTo && feature.assignedTo.name &&
                  <>
                    <UncontrolledTooltip target={"assigned-to-" + feature.id} placement="top">
                      {feature.assignedTo.name}
                    </UncontrolledTooltip>
                    <span
                      className="avatar avatar-xs rounded-circle"
                      style={{ backgroundColor: textToColor(feature.assignedTo.name) }}
                      id={"assigned-to-" + feature.id}>{memberNameInitials(feature.assignedTo.name)}
                </span>
                  </>}
                {!feature.assignedTo && "-"}
              </td>}
              <td>
                <Badge color={priorityColor(feature.priority)} pill={true}>
                  {feature.priority}
                </Badge>
              </td>
            </tr>
          ))}
          {onAddFeature &&
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
                            id={"save-feature"}
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

export default FeaturesList;

FeaturesList.propTypes = {
  features: PropTypes.array.isRequired,
  onAddFeature: PropTypes.func,
  onChangePriority: PropTypes.func,
  onChangeStatus: PropTypes.func,
  onChangeMilestone: PropTypes.func,
  onChangeKeyResult: PropTypes.func,
  onChange: PropTypes.func,
  showAssignedTo: PropTypes.bool,
  enableContextMenu: PropTypes.bool,
  id: PropTypes.string,
  headerClassName: PropTypes.string
};