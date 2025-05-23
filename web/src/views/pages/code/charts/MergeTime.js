import React, {useEffect} from "react";
import {Line} from "react-chartjs-2";
import {Button, ButtonGroup, Card, CardBody, CardHeader, Col, Row} from "reactstrap";
import {averageMergeTimeChartOptions, chartOptions, parseOptions} from "../../../../variables/charts";
import Chart from "chart.js";
import {getPRsAverageMergeTime} from "../../../../services/github/github.service";
import {formatDate} from "../../../../services/utils/utils";
import LoadingSpinnerBox from "../../components/LoadingSpinnerBox";

export function MergeTime({orgId, projectId, getPrData}) {
    if (window.Chart) {
        parseOptions(Chart, chartOptions());
    }
    const [data, setData] = React.useState([]);
    const [prCount, setPrCount] = React.useState([]);
    const [labels, setLabels] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const [averageMergeTime, setAverageMergeTime] = React.useState(0);
    const [timeframeInDays, setTimeframeInDays] = React.useState(30);
    useEffect(() => {
        fetchData(365).catch(console.error);
    }, []);

    const fetchData = async (timeframe) => {
        setTimeframeInDays(timeframe);
        setIsLoading(true);
        const data = await getPrData(orgId, projectId, timeframe);
        const labels = data.map(item => formatDate(item.week));
        const prCount = data.map(item => item.prCount);
        const mergeTime = data.map(item => Math.round(item.averageMergeTime / 24));
        const averageMergeTime = (mergeTime.reduce((acc, value) => acc + value) / mergeTime.length).toFixed(1);
        setAverageMergeTime(averageMergeTime);
        setPrCount(prCount)
        setLabels(labels);
        setData(mergeTime);
        setIsLoading(false);
    }
    return (
        <>
            {isLoading ? <Row>
                    <Col className="text-center">
                        <LoadingSpinnerBox/>
                    </Col>
                </Row>
                :
                <Card>
                    <CardHeader>
                        <Row>
                            <Col>
                                <h1 className="h3 mb-0">Merge time</h1>
                                <p className="text-sm mb-0">
                                    <span className="text-nowrap">Average merge time</span>
                                    <br/>
                                    <strong>{averageMergeTime} hours per PR </strong>
                                    <br/>
                                </p>
                            </Col>
                            <Col className='text-right'>
                                <ButtonGroup className="btn-group-toggle" data-toggle="buttons">
                                    <Button className={timeframeInDays === 365 ? 'active' : ''} color="secondary" onClick={() => fetchData(365)}>
                                        <input
                                            autoComplete="off"
                                            name="options"
                                            type="radio"
                                            value={365}
                                        />
                                        Last year
                                    </Button>
                                    <Button className={timeframeInDays === 180 ? 'active' : ''} color="secondary" onClick={() => fetchData(180)}>
                                        <input
                                            autoComplete="off"
                                            name="options"
                                            type="radio"
                                            value={180}
                                        />
                                        Last 6 months
                                    </Button>
                                    <Button className={timeframeInDays === 30 ? 'active' : ''} color="secondary" onClick={() => fetchData(30)}>
                                        <input
                                            autoComplete="off"
                                            name="options"
                                            type="radio"
                                            value={30}
                                        />
                                        Last month
                                    </Button>
                                </ButtonGroup>
                            </Col>
                        </Row>
                    </CardHeader>
                    <CardBody>
                        <div className="chart">
                            <Line
                                data={{
                                    labels,
                                    datasets: [
                                        {
                                            label: "Merge time",
                                            data,
                                            tension: 0.4,
                                            order: 1
                                        },
                                        {
                                            label: "Number of PRs",
                                            data: prCount,
                                            fill: true,
                                            type: "bar",
                                            barThickness: 20,
                                            order: 2,
                                            backgroundColor: "rgba(0, 123, 255, 0.2)",
                                        },
                                    ]
                                }}
                                options={averageMergeTimeChartOptions}
                                className="chart-canvas"
                            />
                        </div>
                    </CardBody>
                </Card>
            }
        </>
    );
}

