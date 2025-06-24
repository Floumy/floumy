import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap';
import { Bar, Pie } from 'react-chartjs-2';
import React, { useEffect, useState } from 'react';
import Chart from 'chart.js';
import {
  chartOptions,
  colors,
  parseOptions,
} from '../../../../variables/charts';
import {
  formatDate,
  formatWorkItemStatusName,
  formatWorkItemTypeName,
  workItemsColorVariable,
  workItemsTypeColorVariable,
} from '../../../../services/utils/utils';

function ExecutionStats({ workItems, dueDate }) {
  const [estimationsDistribution, setEstimationsDistribution] = useState([]);
  const [estimationsDistributionLabels, setEstimationsDistributionLabels] =
    useState([]);

  const [workItemsCountByStatus, setWorkItemsCountByStatus] = useState([]);
  const [workItemsCountByStatusLabels, setWorkItemsCountByStatusLabels] =
    useState([]);
  const [workItemsCountByStatusColors, setWorkItemsCountByStatusColors] =
    useState([]);

  const [workItemsCountByType, setWorkItemsCountByType] = useState([]);
  const [workItemsCountByTypeLabels, setWorkItemsCountByTypeLabels] = useState(
    [],
  );
  const [workItemsCountByTypeColors, setWorkItemsCountByTypeColors] = useState(
    [],
  );

  const [overallCompletion, setOverallCompletion] = useState(0);

  const [effortLeftByEstimation, setEffortLeftByEstimation] = useState(0);

  const [showWorkItemsBy, setShowWorkItemsBy] = useState('status');

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  function calculateEstimationsDistribution(workItems) {
    const estimationsCount = {};

    workItems.forEach((workItem) => {
      const estimation = workItem.estimation || 0;
      estimationsCount[estimation] = (estimationsCount[estimation] || 0) + 1;
    });

    const estimationsDistributionLabels = Object.keys(estimationsCount).sort(
      (a, b) => a - b,
    );
    const estimationsDistribution = estimationsDistributionLabels.map(
      (label) => estimationsCount[label],
    );

    setEstimationsDistribution(estimationsDistribution);
    setEstimationsDistributionLabels(estimationsDistributionLabels);
  }

  function calculateWorkItemsByStatus(workItems) {
    const workItemsCountByStatus = [];
    const workItemsCountByStatusLabels = [];
    workItems.forEach((workItem) => {
      if (workItemsCountByStatusLabels.includes(workItem.status)) {
        workItemsCountByStatus[
          workItemsCountByStatusLabels.indexOf(workItem.status)
        ]++;
      } else {
        workItemsCountByStatusLabels.push(workItem.status);
        workItemsCountByStatus.push(1);
      }
    });
    setWorkItemsCountByStatus(workItemsCountByStatus);
    setWorkItemsCountByStatusLabels(workItemsCountByStatusLabels);
    setWorkItemsCountByStatusColors(
      workItemsCountByStatusLabels.map((status) =>
        workItemsColorVariable(status),
      ),
    );
  }

  function calculateOverallCompletion(workItems) {
    const totalNumberOfWorkItems = workItems.length;
    const totalNumberOfCompletedWorkItems = workItems.filter(
      (workItem) => workItem.status === 'done' || workItem.status === 'closed',
    ).length;
    setOverallCompletion(
      Math.round(
        (totalNumberOfCompletedWorkItems / totalNumberOfWorkItems) * 100,
      ),
    );
  }

  function calculateEffortLeftByEstimation(workItems) {
    let totalEstimation = 0;
    let totalCompletedEstimation = 0;
    workItems.forEach((workItem) => {
      totalEstimation += workItem.estimation;
      if (workItem.status === 'done' || workItem.status === 'closed') {
        totalCompletedEstimation += workItem.estimation;
      }
    });
    if (totalCompletedEstimation === 0) {
      setEffortLeftByEstimation(0);
      return;
    }
    const completedEstimationPercentage =
      totalCompletedEstimation / totalEstimation;
    setEffortLeftByEstimation(
      Math.round((1 - completedEstimationPercentage) * 100),
    );
  }

  function calculateWorkItemsByType(workItems) {
    const workItemsCountByType = [];
    const workItemsCountByTypeLabels = [];
    workItems.forEach((workItem) => {
      if (workItemsCountByTypeLabels.includes(workItem.type)) {
        workItemsCountByType[
          workItemsCountByTypeLabels.indexOf(workItem.type)
        ]++;
      } else {
        workItemsCountByTypeLabels.push(workItem.type);
        workItemsCountByType.push(1);
      }
    });
    setWorkItemsCountByType(workItemsCountByType);
    setWorkItemsCountByTypeLabels(workItemsCountByTypeLabels);
    setWorkItemsCountByTypeColors(
      workItemsCountByTypeLabels.map((type) =>
        workItemsTypeColorVariable(type),
      ),
    );
  }

  useEffect(() => {
    calculateEstimationsDistribution(workItems);
    calculateWorkItemsByStatus(workItems);
    calculateWorkItemsByType(workItems);
    calculateOverallCompletion(workItems);
    calculateEffortLeftByEstimation(workItems);
  }, [workItems]);

  return (
    <>
      <Row>
        <Col sm={6}>
          <Card>
            <CardHeader>
              <h5 className="h3 mb-0">Work Items Estimations</h5>
            </CardHeader>
            <CardBody>
              <div className="chart">
                <div className="chart">
                  <Bar
                    data={{
                      labels: estimationsDistributionLabels.map((label) => {
                        if (label === '0') {
                          return '-';
                        }
                        return label;
                      }),
                      datasets: [
                        {
                          label: 'Estimations Distribution',
                          data: estimationsDistribution,
                          maxBarThickness: 20,
                          backgroundColor: colors.theme.primary,
                        },
                      ],
                    }}
                    options={{
                      animation: false,
                      scales: {
                        yAxes: [
                          {
                            gridLines: {
                              color: colors.gray[200],
                              zeroLineColor: colors.gray[200],
                            },
                            ticks: {
                              callback: function (value) {
                                if (!(value % 10)) {
                                  return value;
                                }
                              },
                            },
                            scaleLabel: {
                              display: true,
                              labelString: 'Number of Work Items',
                            },
                          },
                        ],
                        xAxes: [
                          {
                            gridLines: {
                              color: colors.gray[200],
                              zeroLineColor: colors.gray[200],
                            },
                            ticks: {},
                            scaleLabel: {
                              display: true,
                              labelString: 'Estimation',
                            },
                          },
                        ],
                      },
                      tooltips: {
                        callbacks: {
                          label: function (item, data) {
                            const label =
                              data.datasets[item.datasetIndex].label || '';
                            const yLabel = item.yLabel;
                            let content = '';
                            if (data.datasets.length > 1) {
                              content += label;
                            }
                            content += yLabel;
                            return content;
                          },
                        },
                      },
                    }}
                    className="chart-canvas"
                    id="chart-bars"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
        <Col sm={6}>
          <Card>
            <CardHeader>
              <h5 className="h3 mb-0">
                <span className="mr-2">Work Items</span>
                <UncontrolledDropdown>
                  <DropdownToggle caret color="secondary" className="p-0 px-2">
                    by {showWorkItemsBy === 'status' ? 'Status' : 'Type'}
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem
                      onClick={(e) => {
                        e.preventDefault();
                        setShowWorkItemsBy('status');
                      }}
                    >
                      by Status
                    </DropdownItem>
                    <DropdownItem
                      href="#pablo"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowWorkItemsBy('type');
                      }}
                    >
                      by Type
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledDropdown>
              </h5>
            </CardHeader>
            <CardBody>
              <div className="chart">
                {showWorkItemsBy === 'status' && (
                  <Pie
                    data={{
                      labels: workItemsCountByStatusLabels.map(
                        formatWorkItemStatusName,
                      ),
                      datasets: [
                        {
                          data: workItemsCountByStatus,
                          backgroundColor: workItemsCountByStatusColors,
                          label: 'Work Items by Status',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      legend: {
                        display: true,
                        position: 'top',
                      },
                      animation: false,
                      cutoutPercentage: 70,
                      tooltips: {
                        custom: false,
                        mode: 'index',
                        position: 'nearest',
                      },
                    }}
                    className="chart-canvas"
                    id="chart-pie"
                  />
                )}
                {showWorkItemsBy === 'type' && (
                  <Pie
                    data={{
                      labels: workItemsCountByTypeLabels.map(
                        formatWorkItemTypeName,
                      ),
                      datasets: [
                        {
                          data: workItemsCountByType,
                          backgroundColor: workItemsCountByTypeColors,
                          label: 'Work Items by Status',
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      legend: {
                        display: true,
                        position: 'top',
                      },
                      animation: false,
                      cutoutPercentage: 70,
                      tooltips: {
                        custom: false,
                        mode: 'index',
                        position: 'nearest',
                      },
                    }}
                    className="chart-canvas"
                    id="chart-pie"
                  />
                )}
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
                <div className="col">
                  <CardTitle className="text-uppercase text-muted mb-0 ">
                    Completed Items
                  </CardTitle>
                  <span className="h2 font-weight-bold mb-0 ">
                    {overallCompletion}%
                  </span>
                </div>
                <Col className="col-auto">
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
                <div className="col">
                  <CardTitle className="text-uppercase text-muted mb-0 ">
                    Effort Left
                  </CardTitle>
                  <span className="h2 font-weight-bold mb-0 ">
                    {effortLeftByEstimation}%
                  </span>
                </div>
                <Col className="col-auto">
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

export default ExecutionStats;
