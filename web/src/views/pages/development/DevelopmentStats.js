import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Progress,
  Row,
} from 'reactstrap';
import { Line } from 'react-chartjs-2';
import {
  burndownChartOptions,
  chartOptions,
  parseOptions,
} from '../../../variables/charts';
import React, { useEffect, useState } from 'react';
import Chart from 'chart.js';
import PropTypes from 'prop-types';
import { getSprintEndDate } from '../../../services/utils/utils';

function DevelopmentStats({ sprint }) {
  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const [overallCompletion, setOverallCompletion] = useState(0);
  const [estimatedEffortLeft, setEstimatedEffortLeft] = useState(0);
  const [labels, setLabels] = useState([]);
  const [data, setData] = useState([]);
  const [idealBurndown, setIdealBurndown] = useState([]);
  const [totalEstimation, setTotalEstimation] = useState(0);

  // Helpers to choose progress bar colors
  const getCompletionColor = (value) => {
    if (value >= 60) return 'success';
    if (value >= 30) return 'warning';
    return 'danger';
  };
  const getEffortLeftColor = (value) => {
    // Lower remaining effort is better
    if (value >= 60) return 'success';
    if (value >= 30) return 'warning';
    return 'danger';
  };

  function isDoneBefore(workItem, currentDate) {
    return (
      workItem.status === 'done' && new Date(workItem.completedAt) < currentDate
    );
  }

  function isClosedBefore(workItem, currentDate) {
    return (
      workItem.status === 'closed' &&
      new Date(workItem.completedAt) < currentDate
    );
  }

  function getTotalEstimation(workItems) {
    return workItems.reduce((acc, workItem) => {
      return acc + workItem.estimation;
    }, 0);
  }

  function calculateDaysLeft(sprint) {
    const currentDate = new Date();
    currentDate.setHours(23, 59, 59, 999);
    return Math.ceil(
      (getSprintEndDate(sprint) - currentDate) / (24 * 60 * 60 * 1000),
    );
  }

  useEffect(() => {
    function calculateTotalEstimation(workItems) {
      const totalEstimation = getTotalEstimation(workItems);
      setTotalEstimation(totalEstimation);
    }

    function calculateOverallCompletion(workItems) {
      const totalNumberOfWorkItems = workItems.length;
      const totalNumberOfCompletedWorkItems = workItems.filter(
        (workItem) =>
          workItem.status === 'done' || workItem.status === 'closed',
      ).length;
      setOverallCompletion(
        Math.round(
          (totalNumberOfCompletedWorkItems / totalNumberOfWorkItems) * 100,
        ),
      );
    }

    function calculateEstimatedEffortLeft(workItems) {
      let totalCompletedEstimation = 0;
      workItems.forEach((workItem) => {
        if (workItem.status === 'done' || workItem.status === 'closed') {
          totalCompletedEstimation += workItem.estimation;
        }
      });
      const completedEstimationPercentage =
        totalCompletedEstimation / getTotalEstimation(workItems);
      setEstimatedEffortLeft(
        Math.round((1 - completedEstimationPercentage) * 100),
      );
    }

    function setBurndownLabels() {
      const labels = [];
      let numberOfDays = sprint.duration * 7;
      const startDate = new Date(sprint.actualStartDate);
      const daysLeft = calculateDaysLeft(sprint);
      if (daysLeft < 0) {
        numberOfDays += Math.abs(daysLeft);
      }
      for (let i = 0; i < numberOfDays; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        // Format date as ex: Fri 1 Jan
        const formattedDate = `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getDate()} ${date.toLocaleDateString('en-US', { month: 'short' })}`;
        labels.push(formattedDate);
      }
      setLabels(labels);
    }

    function calculateIdealBurndown() {
      const idealBurndown = [];

      let numberOfDays = sprint.duration * 7;
      const daysLeft = calculateDaysLeft(sprint);
      if (daysLeft < 0) {
        numberOfDays += Math.abs(daysLeft);
      }
      const totalEstimation = getTotalEstimation(sprint.workItems);
      const dailyEffort = totalEstimation / (numberOfDays - 1);

      for (let i = 0; i < numberOfDays; i++) {
        idealBurndown.push(totalEstimation - i * dailyEffort);
      }

      setIdealBurndown(idealBurndown);
    }

    function calculateBurndown(workItems) {
      const data = [];
      const startDate = new Date(sprint.actualStartDate);
      let numberOfDays = Math.ceil(
        (new Date() - startDate) / (24 * 60 * 60 * 1000),
      );
      const daysLeft = calculateDaysLeft(sprint);
      if (daysLeft < 0) {
        numberOfDays += Math.abs(daysLeft);
      }
      for (let i = 0; i < numberOfDays; i++) {
        const currentDate = new Date(
          startDate.getTime() + i * 24 * 60 * 60 * 1000,
        );
        currentDate.setHours(23, 59, 59, 999);
        const totalCompletedEstimation = workItems
          .filter(
            (workItem) =>
              isDoneBefore(workItem, currentDate) ||
              isClosedBefore(workItem, currentDate),
          )
          .reduce((acc, workItem) => {
            return acc + workItem.estimation;
          }, 0);
        data.push(getTotalEstimation(workItems) - totalCompletedEstimation);
      }
      setData(data);
    }

    if (sprint.workItems.length > 0) {
      calculateTotalEstimation(sprint.workItems);
      calculateOverallCompletion(sprint.workItems);
      calculateEstimatedEffortLeft(sprint.workItems);
      setBurndownLabels();
      calculateBurndown(sprint.workItems);
      calculateIdealBurndown();
    }
  }, [sprint]);

  if (totalEstimation === 0) {
    return null;
  }

  return (
    <>
      <Row>
        <Col className="d-none d-sm-block">
          <Card>
            <CardHeader>
              <h5 className="h3 mb-0">
                Effort Burndown based on Work Items Estimation
              </h5>
            </CardHeader>
            <CardBody>
              <div className="chart">
                <Line
                  data={
                    (/* canvas */) => {
                      return {
                        labels,
                        datasets: [
                          {
                            label: 'Effort Left',
                            data,
                            borderColor: '#5e4387',
                            // Use scriptable background to rebuild gradient after any update/resize
                            backgroundColor: function (context) {
                              const chart = context.chart;
                              const { ctx, chartArea } = chart || {};
                              if (!chartArea) {
                                return 'rgba(94, 67, 135, 0.2)';
                              }
                              const gradient = ctx.createLinearGradient(
                                0,
                                chartArea.top,
                                0,
                                chartArea.bottom,
                              );
                              gradient.addColorStop(
                                0,
                                'rgba(94, 67, 135, 0.35)',
                              );
                              gradient.addColorStop(
                                0.5,
                                'rgba(94, 67, 135, 0.18)',
                              );
                              gradient.addColorStop(
                                1,
                                'rgba(94, 67, 135, 0.04)',
                              );
                              return gradient;
                            },
                            fill: true,
                            borderWidth: 2,
                            pointRadius: 3,
                            pointHoverRadius: 5,
                            lineTension: 0.25,
                          },
                          {
                            label: 'Ideal Burndown',
                            data: idealBurndown,
                            borderColor: 'rgba(82, 95, 127, 0.5)',
                            backgroundColor: 'rgba(0,0,0,0)',
                            borderWidth: 2,
                            borderDash: [6, 6],
                            pointRadius: 0,
                            fill: false,
                          },
                        ],
                      };
                    }
                  }
                  options={{
                    ...burndownChartOptions,
                    legend: { display: true },
                    scales: {
                      ...(burndownChartOptions.scales || {}),
                      xAxes: [
                        {
                          ...((burndownChartOptions.scales &&
                            burndownChartOptions.scales.xAxes &&
                            burndownChartOptions.scales.xAxes[0]) ||
                            {}),
                          scaleLabel: { display: false },
                        },
                      ],
                      yAxes: [
                        {
                          ...((burndownChartOptions.scales &&
                            burndownChartOptions.scales.yAxes &&
                            burndownChartOptions.scales.yAxes[0]) ||
                            {}),
                          scaleLabel: { display: false },
                          ticks: {
                            ...((burndownChartOptions.scales &&
                              burndownChartOptions.scales.yAxes &&
                              burndownChartOptions.scales.yAxes[0] &&
                              burndownChartOptions.scales.yAxes[0].ticks) ||
                              {}),
                            suggestedMax: totalEstimation
                              ? Math.ceil(totalEstimation * 1.05)
                              : undefined,
                          },
                        },
                      ],
                    },
                  }}
                  className="chart-canvas"
                />
              </div>
            </CardBody>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={12} lg={6}>
          <Card>
            <CardBody>
              <Row>
                <Col>
                  <CardTitle className="text-uppercase text-muted mb-1">
                    Completed Items
                  </CardTitle>
                  <div className="d-flex align-items-baseline mb-2">
                    <span className="h2 font-weight-bold mb-0 mr-2">
                      {overallCompletion}%
                    </span>
                  </div>
                  <Progress
                    max={100}
                    value={overallCompletion}
                    color={getCompletionColor(overallCompletion)}
                    className="progress-sm"
                  />
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
        <Col md={12} lg={6}>
          <Card>
            <CardBody>
              <Row>
                <Col>
                  <CardTitle className="text-uppercase text-muted mb-1 ">
                    Effort Left
                  </CardTitle>
                  <div className="d-flex align-items-baseline mb-2">
                    <span className="h2 font-weight-bold mb-0 mr-2 ">
                      {estimatedEffortLeft}%
                    </span>
                  </div>
                  <Progress
                    max={100}
                    value={estimatedEffortLeft}
                    color={getEffortLeftColor(estimatedEffortLeft)}
                    className="progress-sm"
                  />
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

DevelopmentStats.propTypes = {
  sprint: PropTypes.object.isRequired,
};

export default DevelopmentStats;
