import React, {useEffect, useState} from 'react';
import InfiniteLoadingBar from '../components/InfiniteLoadingBar';
import SimpleHeader from '../../../components/Headers/SimpleHeader';
import {Card, CardBody, CardHeader, CardTitle, Col, Container, Row, UncontrolledTooltip} from 'reactstrap';
import LoadingSpinnerBox from '../components/LoadingSpinnerBox';
import {
    deleteProjectGithubRepo,
    getGithubRepos,
    getGithubUrl,
    getIsGithubConnected, getPRsAverageMergeTime, getPRsCycleTime,
    getPullRequests,
    updateProjectGithubRepo,
} from '../../../services/github/github.service';
import {useProjects} from '../../../contexts/ProjectsContext';
import Select2 from 'react-select2-wrapper';
import {toast} from 'react-toastify';
import {useNavigate} from 'react-router-dom';
import UpdateWarning from '../components/UpdateWarning';
import DeleteWarning from '../components/DeleteWarning';
import PRs from '../../../components/Code/PRs';
import {CycleTime} from "./charts/CycleTime";
import {MergeTime} from "./charts/MergeTime";

function GitHub() {
    const {orgId, currentProject} = useProjects();

    const [isLoading, setIsLoading] = useState(false);
    const [isGithubConnected, setIsGithubConnected] = useState(false);

    const [callbackUrl, setCallbackUrl] = useState('');
    const [repos, setRepos] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState('');
    const [repo, setRepo] = useState(null);
    const [prs, setPrs] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [updateWarning, setUpdateWarning] = useState(false);
    const [disconnectWarning, setDisconnectWarning] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!currentProject?.id || !orgId) return;

        const fetchGithubData = async () => {
            setIsLoading(true);
            try {
                const {connected, repo} = await getIsGithubConnected(orgId, currentProject.id);
                setIsGithubConnected(connected);

                if (!connected) {
                    try {
                        const url = await getGithubUrl(orgId, currentProject.id);
                        setCallbackUrl(url);
                    } catch (error) {
                        toast.error('Failed to connect to Github');
                        setCallbackUrl('');
                    }
                } else if (!repo?.id) {
                    try {
                        const repositories = await getGithubRepos(orgId, currentProject.id);
                        setRepos(repositories);
                    } catch (error) {
                        toast.error('Failed to fetch repositories');
                        setRepos([]);
                    }
                } else {
                    setRepo(repo);
                    try {
                        const prs = await getPullRequests(orgId, currentProject.id);
                        setPrs(prs);
                    } catch (error) {
                        toast.error('Failed to fetch pull requests');
                        setPrs(null);
                    }
                }
            } catch (error) {
                setIsGithubConnected(false);
                toast.error('Failed to check Github connection');
            } finally {
                setIsLoading(false);
            }
        };

        fetchGithubData();
    }, [currentProject?.id, orgId]);

    const handleRepoUpdate = async () => {
        try {
            if (isEditing) {
                setUpdateWarning(true);
                return;
            }

            const projectRepo = await updateProjectGithubRepo(orgId, currentProject.id, selectedRepo);
            setRepo(projectRepo);
            setUpdateWarning(false);
            const prs = await getPullRequests(orgId, currentProject.id);
            setPrs(prs);
            setIsEditing(false);
            setIsGithubConnected(true);
            toast.success('Project repository updated');
        } catch (e) {
            toast.error(e.message);
        }
    };

    const handleRepoDisconnect = async () => {
        try {
            await deleteProjectGithubRepo(orgId, currentProject.id, null);
            setRepo(null);
            setIsGithubConnected(false);
            setCallbackUrl('');
            setRepos([]);
            setSelectedRepo('');
            setRepo(null);
            setPrs(null);
            setIsEditing(false);
            setUpdateWarning(false);
            setDisconnectWarning(false);
            toast.success('Project repository disconnected');
            navigate(`/admin/orgs/${orgId}/projects/${currentProject.id}/code`);
        } catch (e) {
            toast.error(e.message);
        }
    };

    const editRepo = async () => {
        setIsEditing(!isEditing);
        try {
            const repositories = await getGithubRepos(orgId, currentProject.id);
            setRepos(repositories);
        } catch (error) {
            toast.error('Failed to fetch repositories');
            setRepos([]);
        }
    };

    return (
        <>
            {isLoading && <InfiniteLoadingBar/>}
            <SimpleHeader/>
            <Container className="mt--6" fluid id="OKRs">
                <UpdateWarning
                    isOpen={updateWarning}
                    toggle={() => setUpdateWarning(!updateWarning)}
                    warningMessage={"It will take a few minutes for the pull requests on your repository to be processed."}
                    entity={"project's repository"}
                    onUpdate={async () => await handleRepoUpdate()}/>
                <DeleteWarning
                    isOpen={disconnectWarning}
                    toggle={() => setDisconnectWarning(!disconnectWarning)}
                    entity={"connection to GitHub"}
                    onDelete={async () => await handleRepoDisconnect()}/>
                <Row>
                    <Col>
                        <Card className="mb-5">
                            <CardHeader>
                                <Row>
                                    <Col md={12}>
                                        <CardTitle tag="h2" className="mb-3"> {repo ? <>
                                            Pull Requests {" "}
                                            <a className="btn-link text-blue mr-2" href={repo.url} target="_blank"
                                               rel="noreferrer">
                                                | {repo.name}
                                            </a>
                                            <i className="fa fa-edit mr-2" style={{cursor: 'pointer'}}
                                               onClick={editRepo}/>
                                            <UncontrolledTooltip target="disconnect-from-github" placement="top">
                                                Disconnect from GitHub
                                            </UncontrolledTooltip>
                                            <i className="fa fa-trash-alt mr-2" style={{cursor: 'pointer'}}
                                               id="disconnect-from-github" onClick={() => setDisconnectWarning(true)}/>
                                        </> : <span className="mr-2">GitHub Repository</span>}
                                        </CardTitle>
                                    </Col>
                                </Row>
                            </CardHeader>
                            <CardBody>
                                {!isLoading && prs && !isEditing && <Row>
                                </Row>}
                                {isLoading &&
                                    <Row>
                                        <Col className="text-center">
                                            <LoadingSpinnerBox/>
                                        </Col>
                                    </Row>}
                                {!isLoading && !isGithubConnected &&
                                    <Row>
                                        <Col>
                                            <div>
                                                <button className="btn btn-primary" type="button" onClick={() => {
                                                    window.location.href = callbackUrl;
                                                }}>
                                                    Connect GitHub
                                                </button>
                                            </div>
                                        </Col>
                                    </Row>}
                                {!isLoading && ((!repo && repos.length > 0) || isEditing) &&
                                    <Row>
                                        <Col xl={4}>
                                            <h4>Select a repository</h4>
                                            <Select2
                                                className="form-control"
                                                value={selectedRepo}
                                                data={repos.map(repo => ({id: repo.id, text: repo.full_name}))}
                                                options={{
                                                    placeholder: 'Select a repository',
                                                }}
                                                onSelect={(e) => {
                                                    setSelectedRepo(e.target.value);
                                                }}
                                            ></Select2>
                                            <button className="btn btn-primary my-3" type="button"
                                                    onClick={handleRepoUpdate} disabled={!selectedRepo}>Save
                                            </button>
                                            {isEditing && <button className="btn btn-white my-3" type="button"
                                                                  onClick={() => setIsEditing(false)}>Cancel</button>}
                                        </Col>
                                    </Row>}
                                {!isLoading && prs && !isEditing &&
                                    <PRs prs={prs} orgId={orgId} projectId={currentProject.id}/>}
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {!isLoading && currentProject && repo &&
                        <CycleTime orgId={orgId} projectId={currentProject.id} getPrData={getPRsCycleTime}/>
                        }
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {!isLoading && currentProject && repo &&
                        <MergeTime orgId={orgId} projectId={currentProject.id} getPrData={getPRsAverageMergeTime}/>
                        }
                    </Col>
                </Row>
            </Container>
        </>
    );
}

export default GitHub;