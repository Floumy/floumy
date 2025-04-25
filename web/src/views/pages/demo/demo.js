import {Alert, Badge, Button, Card, Col, Row} from "reactstrap";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import React, {useEffect, useState} from "react";
import {getOrg} from "../../../services/org/orgs.service";
import "./demo.css";
import {generateDemoProjectItems} from "../../../services/ai/ai.service";
import {completeDemoProject, createDemoProject} from "../../../services/demo/demo.service";
import InfiniteLoadingBar from "../components/InfiniteLoadingBar";
import {Link, useNavigate} from "react-router-dom";

export function Demo() {
    const [project, setProject] = useState({});
    const [org, setOrg] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [description, setDescription] = useState("");
    const [generatedItems, setGeneratedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            const org = await getOrg();
            setOrg(org)
            setProject(org.projects[0]);
        }
        fetchData();
    }, []);
    const handleComplete = async () => {
        setLoading(true)
        try {
            await createDemoProject(org.id, project.id, generatedItems);
            await complete();
        } catch (e) {
            console.log(e)
        }

    };
    const onTabChange = (e) => {
        setCurrentStep(e.prevIndex + 1)
    }
    const generateItems = async (nextTab) => {
        setLoading(true);
        try {
            const items = await generateDemoProjectItems(description);
            setGeneratedItems(items);
            setLoading(false);
            nextTab();
        } catch (e) {
            console.error(e);
        }
    }
    const complete = async () => {
        setLoading(true);
        try {
            await completeDemoProject(org.id, project.id);
        } catch (e) {
            console.log(e)
        }
        navigate(`/admin/orgs/${org.id}/projects/${project.id}/dashboard`)
        setLoading(false);
    }
    return (
        <>
            {loading && <InfiniteLoadingBar/>}
            <Row className="justify-content-center mt-4">
                <Col lg="8" md="10">
                    <Card className='p-4'>
                        <h1 className="text-center">Let's kickstart your project</h1>
                    </Card>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <Col lg="8" md="10">
                    <Card className='p-4'>
                        <FormWizard
                            disableBackOnClickStep={true}
                            stepSize="sm"
                            color="#435487"
                            onTabChange={onTabChange}
                            onComplete={handleComplete}
                            nextButtonTemplate={(handleNext) => {
                                let onClick;
                                if (currentStep === 1) {
                                    onClick = () => generateItems(handleNext)
                                } else {
                                    onClick = handleNext
                                }
                                let buttonDisabled = false;
                                if ((currentStep === 1 && description === "") || loading) {
                                    buttonDisabled = true;
                                }
                                return <Button color="primary" disabled={buttonDisabled} className={"float-right"}
                                               onClick={onClick}>
                                    {loading ? "Generating..." : "Next"}
                                </Button>
                            }}
                            backButtonTemplate={(handleBack) => {
                                let buttonDisabled = false;
                                if (currentStep === 2) {
                                    buttonDisabled = true;
                                }
                                return <Button color="primary" disabled={buttonDisabled} className={"float-left"}
                                               onClick={handleBack}>
                                    Back
                                </Button>
                            }}
                            finishButtonTemplate={(handleComplete) => (
                                <Button color="primary" className={"float-right"} disabled={loading}
                                        onClick={handleComplete}>
                                    {loading ? "Finishing..." : "Finish"}
                                </Button>
                            )}
                        >
                            <FormWizard.TabContent title="Let's get started">
                                <h3 className="text-left mt-4">Tell us more about {project.name}</h3>
                                <Alert color="secondary" className="text-left">
                                    Provide a brief overview of your project to help generate relevant OKRs,
                                    initiatives, and work items. Describe the project's purpose, key goals, and any
                                    challenges you want to address. A well-defined description ensures that objectives
                                    align with your business needs.
                                    <br/>
                                    <br/>
                                    Example: <i>Our project is a cloud backup service designed for small businesses,
                                    ensuring
                                    secure and reliable data storage. We aim to enhance system uptime, data
                                    encryption, and user experience while maintaining cost efficiency. One of our
                                    key challenges is minimizing downtime and data loss risks, especially during
                                    peak usage.</i>
                                </Alert>
                                <textarea onChange={(e) => setDescription(e.target.value)} rows="5"
                                          className="form-control"/>
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Objectives">
                                <h3 className="text-left mt-4">We generated a list of objectives</h3>
                                <Alert color="secondary" className="text-left">
                                    An <strong>objective</strong> is a clear, ambitious, and qualitative goal that
                                    defines what a team wants to achieve.
                                    It provides direction, aligns efforts, and should be inspiring yet realistic within
                                    a set timeframe. Objectives focus on outcomes rather than specific tasks, ensuring
                                    the team works toward meaningful progress.
                                </Alert>
                                <Objectives generatedItems={generatedItems}/>
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Key Results">
                                <h3 className="text-left mt-4">Your Key Success Metrics</h3>
                                <Alert color="secondary" className="text-left">
                                    <strong>Key Results</strong> are specific, measurable outcomes that track progress
                                    toward an
                                    Objective. They define success by providing clear, quantitative benchmarks that
                                    indicate whether the Objective has been achieved. Each Objective typically has 2–5
                                    Key Results, which should be ambitious but attainable.
                                </Alert>
                                <KeyResults generatedItems={generatedItems}/>
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Initiatives">
                                <h3 className="text-left mt-4"> Your Strategic Plan</h3>
                                <Alert color="secondary" className="text-left">
                                    <strong>Initiatives</strong> are high-level projects or actions designed to achieve
                                    Key Results. They
                                    define how the team will accomplish the Objective by outlining strategic efforts but
                                    without specifying granular tasks.
                                </Alert>
                                <Initiatives generatedItems={generatedItems}/>
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Work Items">
                                <h3 className="text-left mt-4"> Your Actionable Tasks</h3>
                                <Alert color="secondary" className="text-left">
                                    <strong>Work Items</strong> are the specific tasks or deliverables within an
                                    Initiative. They break
                                    down the work into actionable steps, such as coding features, fixing bugs, or
                                    conducting security audits.
                                </Alert>
                                <WorkItems generatedItems={generatedItems}/>
                            </FormWizard.TabContent>
                            <FormWizard.TabContent title="Done">
                                <h3 className="text-left mt-4">What's next</h3>
                                <Alert color="secondary" className="text-left">Your project setup is now complete! We've
                                    generated Objectives, Key Results,
                                    Initiatives, and Work Items tailored to your project. In the actual application,
                                    you'll see everything we've created and can refine or expand upon it as needed.
                                    Plus, there’s more—explore additional features like roadmaps, sprints, and progress
                                    tracking to manage your project efficiently. Feel free to experiment and customize
                                    your plan to fit your team's workflow!</Alert>
                            </FormWizard.TabContent>
                        </FormWizard>
                        <Button onClick={complete} color="secondary" className="text-center">Skip
                            to the app ></Button>
                    </Card>
                </Col>
            </Row>
        </>
    );
}

const Objectives = ({generatedItems}) => {
    return (
        <>
            {generatedItems.map((item, index) => (
                <p key={index} className="text-left">
                    <Badge color="primary" className="badge-md">O-{index + 1}</Badge> {item.title}
                </p>
            ))}
        </>
    )
}

const KeyResults = ({generatedItems}) => {
    let krId = 1;
    return (
        <>
            {generatedItems.map((item, index) => (
                <div key={`gi-${index}`}>
                    <p className="text-left">
                        <Badge color="primary"
                               className="badge-md">O-{index + 1}</Badge> {item.title}
                    </p>
                    {item.keyResults.map((kr) => (
                        <p key={`kr-${krId}`} className="text-left ml-4"><Badge
                            className="badge-md badge-info">KR-{krId++}</Badge> {kr.title}</p>
                    ))}
                </div>
            ))}
        </>
    )
}

const Initiatives = ({generatedItems}) => {
    let krId = 1;
    let initiativeId = 1;
    return (
        <>
            {generatedItems.map((item) => {
                return item.keyResults.map((kr) => (
                    <div key={`kr-${krId}`}>
                        <p className="text-left">
                            <Badge
                                className="badge-md badge-info">KR-{krId++}</Badge> {kr.title}
                        </p>
                        {kr.initiatives.map((initiative) => (
                            <p key={`kri-${initiativeId}}`} className="text-left ml-4">
                                <Badge color="success"
                                       className="badge-md">I-{initiativeId++}</Badge> {initiative.title}
                            </p>
                        ))}
                    </div>
                ))
            })}
        </>
    )
}

const WorkItems = ({generatedItems}) => {
    let initiativeId = 1;
    let workItemId = 1;
    return (
        <>
            {generatedItems.map((item) => (
                item.keyResults.map((kr) => (
                    kr.initiatives.map((initiative) => (
                        <div key={`kri-${initiativeId}`}>
                            <p className="text-left">
                                <Badge color="success"
                                       className="badge-md">I-{initiativeId++}</Badge> {initiative.title}
                            </p>
                            {initiative.workItems.map((workItem) => (
                                <p key={`kriw-${workItemId}`} className="text-left ml-4">
                                    <Badge color="warning"
                                           className="badge-md">WI-{workItemId++}</Badge> {workItem.title}
                                </p>
                            ))}
                        </div>
                    ))
                ))
            ))}
        </>
    )
}