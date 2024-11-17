import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { Line } from "react-chartjs-2";
import Chart from "chart.js";

import PropTypes from "prop-types";
import { chartOptions, cumulativeIssuesChartOptions, parseOptions } from "../../../variables/charts";


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

      const filteredIssues = issues.filter(issue => new Date(issue.createdAt) >= quarterStart);
      const sortedIssues = [...filteredIssues].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      const data = {
        labels: [],
        open: [],
        closed: []
      };

      // Initialize the data structure with dates for the current quarter
      for (let d = new Date(quarterStart); d <= now; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        data.labels.push(dateStr);
        data.open.push(0);
        data.closed.push(0);
      }

      let openCount = 0;
      let closedCount = 0;

      sortedIssues.forEach(issue => {
        const date = new Date(issue.createdAt);
        const index = Math.floor((date - quarterStart) / (24 * 60 * 60 * 1000));

        if (["resolved", "closed", "cannot-reproduce", "duplicate"].includes(issue.status)) {
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


  const chartData = {
    labels,
    datasets: [
      {
        label: "Open Issues",
        data: openIssues,
        borderColor: "#fb6340",
        backgroundColor: "rgba(251, 99, 64, 0.1)",
        fill: true
      },
      {
        label: "Closed Issues",
        data: closedIssues,
        borderColor: "#2dce89",
        backgroundColor: "rgba(45, 206, 137, 0.1)",
        fill: true
      }
    ]
  };

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
              <Line data={chartData} options={cumulativeIssuesChartOptions} />
            </div>
          </CardBody>
        </Card>
      </Col>
    </Row>
  );
}

IssueStats.propTypes = {
  issues: PropTypes.array.isRequired
};

export default IssueStats;