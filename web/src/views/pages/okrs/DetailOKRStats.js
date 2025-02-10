import { Card, CardBody, CardHeader, CardTitle, Col, Row } from "reactstrap";
import { Line } from "react-chartjs-2";
import { burndownChartOptions, chartOptions, parseOptions } from "../../../variables/charts";
import React, { useEffect, useState } from "react";
import Chart from "chart.js";
import PropTypes from "prop-types";

function DetailOKRStats({ okr }) {
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }
  }, []);

  const [overallCompletion, setOverallCompletion] = useState(0);
  const [estimatedEffortLeft, setEstimatedEffortLeft] = useState(0);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [idealBurndown, setIdealBurndown] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [totalEstimation, setTotalEstimation] = useState(0);

  useEffect(() => {
    function calculateOverallCompletion(workItems) {
      const totalNumberOfWorkItems = workItems.length;
      const totalNumberOfCompletedWorkItems = workItems.filter(workItem => workItem.status === "done" || workItem.status === "closed").length;
      return Math.round(totalNumberOfCompletedWorkItems / totalNumberOfWorkItems * 100);
    }

    function calculateEstimatedEffortLeft(workItems, totalEstimation) {
      let totalCompletedEstimation = 0;
      workItems
        .filter(workItem => (workItem.status === "done" || workItem.status === "closed") && workItem.completedAt !== null)
        .forEach(workItem => {
          totalCompletedEstimation += workItem.estimation;
        });
      const completedEstimationPercentage = totalCompletedEstimation / totalEstimation;
      return Math.round((1 - completedEstimationPercentage) * 100);
    }

    function getWeekNumber(d) {
      // Copy date so don't modify original
      d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      // Set to nearest Thursday: current date + 4 - day number
      // Make Sunday's day number 7
      d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
      // Get first day of year
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      // Calculate and return full weeks to nearest Thursday
      // @ts-ignore
      return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    }

    function calculateBurndownAggregatedByWeek(quarterStartDate, workItems, totalEstimation) {
      const MILLISECONDS_PER_DAY = 1000 * 60 * 60 * 24;
      const DAYS_PER_WEEK = 7;

      // Function to convert date difference to weeks
      const dateDiffInWeeks = (date1, date2) => {
        const days = Math.round(Math.abs(date1 - date2) / MILLISECONDS_PER_DAY);
        return Math.ceil(days / DAYS_PER_WEEK);
      };

      // Initialize completed estimations per week
      const weeks = dateDiffInWeeks(new Date(), quarterStartDate);
      const completedEstimationsPerWeek = new Array(weeks).fill(0);

      // Filter and process work items
      workItems.forEach(workItem => {
        if ((workItem.status === "done" || workItem.status === "closed") && workItem.completedAt) {
          const workItemWeekIndex = dateDiffInWeeks(new Date(workItem.completedAt), quarterStartDate) - 1;
          if (workItemWeekIndex >= 0) {
            completedEstimationsPerWeek[workItemWeekIndex] += workItem.estimation;
          }
        }
      });

      // Calculate cumulative estimations
      for (let i = 1; i < completedEstimationsPerWeek.length; i++) {
        completedEstimationsPerWeek[i] += completedEstimationsPerWeek[i - 1];
      }

      // Prepare and set data
      return completedEstimationsPerWeek.map(value => Math.round((totalEstimation - value) / totalEstimation * 100));
    }

    function calculateIdealBurndownAggregatedByWeek(startDate, endDate) {
      const data = [];
      const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
      const weeks = Math.round(days / 7) - 1;
      const effortPerWeek = 100 / weeks;
      data.push(100);
      for (let i = 1; i <= weeks; i++) {
        data.push(Math.floor(100 - i * effortPerWeek));
      }
      return data;
    }

    function getTotalEstimation(workItems) {
      return workItems.reduce((acc, workItem) => {
        return acc + workItem.estimation;
      }, 0);
    }

    function calculateBurndownAggregatedByWeekLabels(startDate, endDate) {
      const days = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
      const weeks = Math.round(days / 7);
      const labels = [];
      for (let i = 0; i < weeks; i++) {
        const date = new Date(startDate.getTime() + i * (1000 * 60 * 60 * 24 * 7));
        const formattedDate = `CW${getWeekNumber(date)} ${date.getFullYear()}`;
        labels.push(formattedDate);
      }
      return labels;
    }

    if (okr.objective) {
      const startDate = new Date(okr.objective.startDate);
      const endDate = new Date(okr.objective.endDate);

      if (startDate > new Date()) {
        return; // If the OKR is in the future, we don't have any data to display
      }

      if (okr.keyResults) {
        const workItems = okr.keyResults
          .filter(keyResult => keyResult.initiatives)
          .flatMap(keyResult => keyResult.initiatives)
          .flatMap(initiative => initiative.workItems);
        setWorkItems(workItems);

        const totalEstimation = getTotalEstimation(workItems);
        setTotalEstimation(totalEstimation);

        if (workItems.length > 0 && totalEstimation > 0) {
          setOverallCompletion(calculateOverallCompletion(workItems));
          setEstimatedEffortLeft(calculateEstimatedEffortLeft(workItems, totalEstimation));
          const labels = calculateBurndownAggregatedByWeekLabels(startDate, endDate);
          setLabels(labels);
          setData(calculateBurndownAggregatedByWeek(startDate, workItems, totalEstimation));
          setIdealBurndown(calculateIdealBurndownAggregatedByWeek(startDate, endDate));
        }
      }
    }
  }, [okr]);

  if (workItems.length === 0 || totalEstimation === 0) {
    return null;
  }

  return (
    <>
      <Row>
        <Col className="d-none d-sm-block">
          <Card>
            <CardHeader>
              <h5 className="h3 mb-0">Effort Burndown by Work Items Estimation</h5>
            </CardHeader>
            <CardBody>
              <div className="chart">
                <Line
                  data={{
                    labels,
                    datasets: [
                      {
                        label: 'Effort Left (%)',
                        data,
                      },
                      {
                        label: 'Ideal burndown (%)',
                        data: idealBurndown,
                        borderColor: 'rgb(225, 237, 245)',
                        backgroundColor: 'rgba(225, 237, 245)',
                      },
                    ],
                  }}
                  options={burndownChartOptions}
                  className="chart-canvas"
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col sm={12} md={6}>
          <Card>
            <CardBody>
              <Row>
                <Col>
                  <CardTitle className="text-uppercase text-muted mb-0 ">
                    Overall Completion
                  </CardTitle>
                  <span className="h2 font-weight-bold mb-0 ">
                      {overallCompletion}%
                    </span>
                </Col>
                <Col className="text-right col-auto">
                  <div className="icon icon-shape bg-white text-primary rounded-circle bg-lighter">
                    <i className="ni ni-check-bold" />
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
        <Col sm={12} md={6}>
          <Card>
            <CardBody>
              <Row>
                <Col>
                  <CardTitle className="text-uppercase text-muted mb-0 ">
                    Effort Left
                  </CardTitle>
                  <span className="h2 font-weight-bold mb-0 ">
                      {estimatedEffortLeft}%
                    </span>
                </Col>
                <Col className="text-right col-auto">
                  <div className="icon icon-shape bg-white text-primary rounded-circle bg-lighter">
                    <i className="ni ni-building" />
                  </div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  );
}

DetailOKRStats.propTypes = {
  okr: PropTypes.object.isRequired,
};

export default DetailOKRStats;
