import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, CardTitle, Col, Row, Button, ButtonGroup } from 'reactstrap';
import { Line } from 'react-chartjs-2';

export function ReviewEfficiency({ orgId, projectId, getPrData }) {
    const [data, setData] = useState(null);
    const [timeframe, setTimeframe] = useState(30);

    useEffect(() => {
        const fetchData = async () => {
            const result = await getPrData(orgId, projectId, timeframe);
            setData(result);
        };
        fetchData();
    }, [orgId, projectId, timeframe, getPrData]);

    if (!data) return null;

    const chartData = {
        labels: data.map(d => new Date(d.week).toLocaleDateString()),
        datasets: [
            {
                label: 'Time to First Approval (hours)',
                data: data.map(d => d.averageTimeToFirstApproval),
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
            {
                label: 'Approval Rate (%)',
                data: data.map(d => d.approvalRate),
                borderColor: 'rgb(255, 99, 132)',
                tension: 0.1,
            },
            {
                label: 'Time to Merge After Approval (hours)',
                data: data.map(d => d.averageTimeToMergeAfterApproval),
                borderColor: 'rgb(54, 162, 235)',
                tension: 0.1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Code Review Efficiency Metrics',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Card className="mb-5">
            <CardHeader>
                <Row>
                    <Col>
                        <CardTitle tag="h3">Code Review Efficiency</CardTitle>
                    </Col>
                    <Col className='text-right'>

                        <ButtonGroup className="mt-3">
                            <Button
                                color={timeframe === 365 ? 'primary' : 'secondary'}
                                onClick={() => setTimeframe(365)}
                            >
                                Last Year
                            </Button>
                            <Button
                                color={timeframe === 180 ? 'primary' : 'secondary'}
                                onClick={() => setTimeframe(180)}
                            >
                                Last 6 Months
                            </Button>
                            <Button
                                color={timeframe === 30 ? 'primary' : 'secondary'}
                                onClick={() => setTimeframe(30)}
                            >
                                Last Month
                            </Button>
                        </ButtonGroup></Col>
                </Row>
            </CardHeader>
            <CardBody>
                <Line data={chartData} options={options} />
            </CardBody>
        </Card>
    );
} 