import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js';

import PropTypes from 'prop-types';
import {
  chartOptions,
  cumulativeIssuesChartOptions,
  parseOptions,
} from '../../../variables/charts';

function IssueStats({ issues }) {
  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const [labels, setLabels] = useState([]);
  const [openIssues, setOpenIssues] = useState([]);
  const [closedIssues, setClosedIssues] = useState([]);

  useEffect(() => {
    function calculateIssueCumulative() {
      const now = new Date();
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const quarterStart = new Date(now.getFullYear(), currentQuarter * 3, 1);

      const filteredIssues = issues.filter(
        (issue) => new Date(issue.createdAt) >= quarterStart,
      );
      const sortedIssues = [...filteredIssues].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );

      const data = {
        labels: [],
        open: [],
        closed: [],
      };

      // Initialize the data structure with dates for the current quarter, plus tomorrow
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 1);
      for (
        let d = new Date(quarterStart);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        const dateStr = d.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        data.labels.push(dateStr);
        data.open.push(0);
        data.closed.push(0);
      }

      let openCount = 0;
      let closedCount = 0;

      sortedIssues.forEach((issue) => {
        const date = new Date(issue.createdAt);
        const index = Math.floor((date - quarterStart) / (24 * 60 * 60 * 1000));

        if (
          ['resolved', 'closed', 'cannot-reproduce', 'duplicate'].includes(
            issue.status,
          )
        ) {
          closedCount++;
        } else {
          openCount++;
        }

        for (let i = index; i < data.labels.length; i++) {
          data.open[i] = openCount;
          data.closed[i] = closedCount;
        }
      });

      setLabels(data.labels);
      setOpenIssues(data.open);
      setClosedIssues(data.closed);
    }

    if (issues.length > 0) {
      calculateIssueCumulative();
    }
  }, [issues]);

  const chartData = (/* canvas */) => {
    return {
      labels,
      datasets: [
        {
          label: 'Open Issues',
          data: openIssues,
          borderColor: '#fb6340',
          // Use scriptable background to rebuild gradient after any update/resize
          backgroundColor: function (context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart || {};
            if (!chartArea) {
              return 'rgba(251, 99, 64, 0.2)';
            }
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            gradient.addColorStop(0, 'rgba(251, 99, 64, 0.35)');
            gradient.addColorStop(0.5, 'rgba(251, 99, 64, 0.18)');
            gradient.addColorStop(1, 'rgba(251, 99, 64, 0.04)');
            return gradient;
          },
          fill: true,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          lineTension: 0.25,
        },
        {
          label: 'Closed Issues',
          data: closedIssues,
          borderColor: '#2dce89',
          backgroundColor: function (context) {
            const chart = context.chart;
            const { ctx, chartArea } = chart || {};
            if (!chartArea) {
              return 'rgba(45, 206, 137, 0.2)';
            }
            const gradient = ctx.createLinearGradient(
              0,
              chartArea.top,
              0,
              chartArea.bottom,
            );
            gradient.addColorStop(0, 'rgba(45, 206, 137, 0.35)');
            gradient.addColorStop(0.5, 'rgba(45, 206, 137, 0.18)');
            gradient.addColorStop(1, 'rgba(45, 206, 137, 0.04)');
            return gradient;
          },
          fill: true,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          lineTension: 0.25,
        },
      ],
    };
  };

  // Ensure the line is fully visible by padding the top of the Y-axis slightly
  const maxYValue = Math.max(
    ...(openIssues && openIssues.length ? openIssues : [0]),
    ...(closedIssues && closedIssues.length ? closedIssues : [0]),
  );

  if (issues.length === 0) {
    return null;
  }

  return (
    <Row>
      <Col>
        <Card>
          <CardHeader>
            <h5 className="h3 mb-0">Open vs Closed Issues</h5>
          </CardHeader>
          <CardBody>
            <div className="chart">
              <Line
                data={chartData}
                options={{
                  ...cumulativeIssuesChartOptions,
                  legend: { display: true },
                  scales: {
                    ...(cumulativeIssuesChartOptions.scales || {}),
                    xAxes: [
                      {
                        ...((cumulativeIssuesChartOptions.scales &&
                          cumulativeIssuesChartOptions.scales.xAxes &&
                          cumulativeIssuesChartOptions.scales.xAxes[0]) ||
                          {}),
                        ticks: {
                          ...((cumulativeIssuesChartOptions.scales &&
                            cumulativeIssuesChartOptions.scales.xAxes &&
                            cumulativeIssuesChartOptions.scales.xAxes[0] &&
                            cumulativeIssuesChartOptions.scales.xAxes[0]
                              .ticks) ||
                            {}),
                          display: false,
                        },
                        scaleLabel: { display: false },
                      },
                    ],
                    yAxes: [
                      {
                        ...((cumulativeIssuesChartOptions.scales &&
                          cumulativeIssuesChartOptions.scales.yAxes &&
                          cumulativeIssuesChartOptions.scales.yAxes[0]) ||
                          {}),
                        scaleLabel: { display: false },
                        ticks: {
                          ...((cumulativeIssuesChartOptions.scales &&
                            cumulativeIssuesChartOptions.scales.yAxes &&
                            cumulativeIssuesChartOptions.scales.yAxes[0] &&
                            cumulativeIssuesChartOptions.scales.yAxes[0]
                              .ticks) ||
                            {}),
                          // Add slight headroom so the top line/points are not clipped
                          suggestedMax: maxYValue
                            ? Math.ceil(maxYValue * 1.05)
                            : undefined,
                        },
                      },
                    ],
                  },
                }}
              />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

IssueStats.propTypes = {
  issues: PropTypes.array.isRequired,
};

export default IssueStats;
