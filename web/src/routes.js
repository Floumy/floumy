import OKRs from './views/pages/okrs/OKRs';
import NewOKR from './views/pages/okrs/NewOKR';
import DetailOKR from './views/pages/okrs/DetailOKR';
import SignIn from './views/pages/auth/SignIn';
import OrgSignUp from './views/pages/auth/OrgSignUp';
import InitiativesRoadmap from './views/pages/roadmap/InitiativesRoadmap';
import ActiveCycle from './views/pages/development/ActiveCycle';
import NewInitiative from './views/pages/roadmap/NewInitiative';
import NewMilestone from './views/pages/roadmap/NewMilestone';
import EditMilestone from './views/pages/roadmap/EditMilestone';
import NewWorkItem from './views/pages/backlog/NewWorkItem';
import EditWorkItem from './views/pages/backlog/EditWorkItem';
import { DetailInitiative } from './views/pages/initiatives/DetailInitiative';
import Cycles from './views/pages/cycles/Cycles';
import WorkItems from './views/pages/backlog/WorkItems';
import NewCycle from './views/pages/cycles/NewCycle';
import EditCycle from './views/pages/cycles/EditCycle';
import Initiatives from './views/pages/initiatives/Initiatives';
import DetailKeyResult from './views/pages/okrs/DetailKeyResult';
import Members from './views/pages/settings/Members';
import ActivationRequired from './views/pages/auth/ActivationRequired';
import Activation from './views/pages/auth/Activation';
import ForgotPassword from './views/pages/auth/ForgotPassword';
import ResetPassword from './views/pages/auth/ResetPassword';
import ResetEmailSent from './views/pages/auth/ResetEmailSent';
import PasswordReset from './views/pages/auth/PasswordReset';
import BuildInPublic from './views/pages/settings/BuildInPublic';
import PublicRoadmap from './views/pages/roadmap/PublicRoadmap';
import { PublicDetailInitiative } from './views/pages/initiatives/PublicDetailInitiative';
import PublicDetailWorkItem from './views/pages/backlog/PublicDetailWorkItem';
import PublicOKRs from './views/pages/okrs/PublicOKRs';
import PublicDetailOKR from './views/pages/okrs/PublicDetailOKR';
import PublicDetailKeyResult from './views/pages/okrs/PublicDetailKeyResult';
import PublicCycles from './views/pages/cycles/PublicCycles';
import PublicCycle from './views/pages/cycles/PublicCycle';
import PublicMilestone from './views/pages/roadmap/PublicMilestone';
import PublicActiveCycle from './views/pages/development/PublicActiveCycle';
import Project from './views/pages/settings/Project';
import MyProfile from './views/pages/users/MyProfile';
import PrivateFeed from './views/pages/feed/PrivateFeed';
import SignUp from './views/pages/auth/SignUp';
import Requests from './views/pages/requests/Requests';
import NewRequest from './views/pages/requests/NewRequest';
import EditRequest from './views/pages/requests/EditRequest';
import RequestDetails from './views/pages/requests/RequestDetails';
import Issues from './views/pages/issues/Issues';
import NewIssue from './views/pages/issues/NewIssue';
import EditIssue from './views/pages/issues/EditIssue';
import IssueDetails from './views/pages/issues/IssueDetails';
import Code from './views/pages/code/Code';
import GitHub from './views/pages/code/GitHub';
import GitLab from './views/pages/code/GitLab';
import Projects from './views/pages/orgs/projects/Projects';
import OrgSettings from './views/pages/settings/OrgSettings';
import { Demo } from './views/pages/demo/demo';
import OrgOKRs from './views/pages/okrs/OrgOKRs';
import DetailOrgOKR from './views/pages/okrs/DetailOrgOKR';
import DetailOrgKeyResult from './views/pages/okrs/DetailOrgKeyResult';
import NewOrgOKR from './views/pages/okrs/NewOrgOKR';
import PermissionDenied from './views/pages/errors/PermissionDenied';
import { Pages } from './views/pages/pages/Pages';
import AiSettings from './views/pages/users/AiSettings';

const routes = [
  {
    redirect: true,
    path: '/dashboard',
    component: <OKRs />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/requests',
    component: <Requests />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/requests/new',
    component: <NewRequest />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/requests/edit/:requestId',
    component: <EditRequest />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/issues',
    component: <Issues />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/issues/new',
    component: <NewIssue />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/issues/edit/:issueId',
    component: <EditIssue />,
    layout: '/admin',
  },
  {
    collapse: false,
    name: 'Feed',
    icon: 'fa fa-newspaper',
    path: '/feed',
    component: <PrivateFeed />,
    layout: '/admin',
    shortcut: '1',
  },
  {
    collapse: false,
    name: 'Objectives',
    icon: 'fa fa-bullseye',
    path: '/okrs',
    component: <OKRs />,
    layout: '/admin',
    shortcut: '2',
  },
  {
    redirect: true,
    path: '/roadmap',
    component: <InitiativesRoadmap />,
    layout: '/admin',
    shortcut: '3',
  },
  {
    redirect: true,
    path: '/roadmap/initiatives/new',
    component: <NewInitiative />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/roadmap/initiatives/detail/:id',
    component: <DetailInitiative />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/roadmap/milestones/new',
    component: <NewMilestone />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/roadmap/milestones/edit/:id',
    component: <EditMilestone />,
    layout: '/admin',
  },
  {
    redirect: true,
    name: 'New Work Item',
    path: '/work-item/new',
    component: <NewWorkItem />,
    layout: '/admin',
  },
  {
    redirect: true,
    name: 'Edit Work Item',
    path: '/work-item/edit/:id',
    component: <EditWorkItem />,
    layout: '/admin',
  },
  {
    collapse: false,
    name: 'Cycles',
    icon: 'fa fa-refresh',
    path: '/cycles',
    component: <Cycles />,
    layout: '/admin',
    shortcut: '4',
  },
  {
    redirect: true,
    path: '/cycles/new',
    component: <NewCycle />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/cycles/edit/:id',
    component: <EditCycle />,
    layout: '/admin',
  },
  {
    collapse: false,
    name: 'Active Cycle',
    icon: 'fa fa-rocket',
    path: '/active-cycle',
    component: <ActiveCycle />,
    layout: '/admin',
    shortcut: '5',
  },
  {
    collapse: false,
    name: 'All Work Items',
    icon: 'fa fa-tasks',
    path: '/work-items',
    component: <WorkItems />,
    layout: '/admin',
    shortcut: '6',
  },
  {
    collapse: false,
    name: 'All Initiatives',
    icon: 'fa fa-list-alt',
    path: '/initiatives',
    component: <Initiatives />,
    layout: '/admin',
    shortcut: '7',
  },
  {
    redirect: true,
    path: '/okrs/new',
    component: <NewOKR />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/okrs/detail/:id',
    component: <DetailOKR />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/kr/detail/:keyResultId',
    component: <DetailKeyResult />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/build-in-public',
    component: <BuildInPublic />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/project',
    component: <Project />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/my-profile',
    component: <MyProfile />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/sign-in',
    component: <SignIn />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/sign-up',
    component: <OrgSignUp />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/simple/sign-up',
    component: <SignUp />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/forgot-password',
    component: <ForgotPassword />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/reset-password',
    component: <ResetPassword />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/reset-email-sent',
    component: <ResetEmailSent />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/password-reset',
    component: <PasswordReset />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/activation',
    component: <Activation />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/activation-required',
    component: <ActivationRequired />,
    layout: '/auth',
  },
  {
    redirect: true,
    path: '/members',
    component: <Members />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/code',
    component: <Code />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/pages',
    component: <Pages />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/pages/:pageId',
    component: <Pages />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/pages/:pageId/:slug',
    component: <Pages />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/code/github',
    component: <GitHub />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/code/gitlab',
    component: <GitLab />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/permission-denied',
    component: <PermissionDenied />,
    layout: '/admin',
  },
];

export const blankRoutes = [
  {
    redirect: true,
    path: '/demo',
    component: <Demo />,
    layout: '/blank',
  },
];

export const publicRoutes = [
  {
    redirect: true,
    path: '/roadmap',
    component: <PublicRoadmap />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/roadmap/initiatives/detail/:initiativeId',
    component: <PublicDetailInitiative />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/work-item/detail/:workItemId',
    component: <PublicDetailWorkItem />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/objectives',
    component: <PublicOKRs />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/okrs/detail/:okrId',
    component: <PublicDetailOKR />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/kr/detail/:keyResultId',
    component: <PublicDetailKeyResult />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/cycles',
    component: <PublicCycles />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/cycles/detail/:cycleId',
    component: <PublicCycle />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/milestones/detail/:milestoneId',
    component: <PublicMilestone />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/active-cycle',
    component: <PublicActiveCycle />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/requests',
    component: <Requests isPublic={true} />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/issues',
    component: <Issues isPublic={true} />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/issues/new',
    component: <NewIssue />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/requests/new',
    component: <NewRequest />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/requests/:requestId',
    component: <RequestDetails />,
    layout: '/public',
  },
  {
    redirect: true,
    path: '/issues/:issueId',
    component: <IssueDetails />,
    layout: '/public',
  },
];

export const orgsRoutes = [
  {
    redirect: true,
    path: '/projects',
    component: <Projects />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/members',
    component: <Members />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/settings',
    component: <OrgSettings />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/objectives',
    component: <OrgOKRs />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/okrs/detail/:objectiveId',
    component: <DetailOrgOKR />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/kr/detail/:keyResultId',
    component: <DetailOrgKeyResult />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/okrs/new',
    component: <NewOrgOKR />,
    layout: '/orgs',
  },
  {
    redirect: true,
    path: '/permission-denied',
    component: <PermissionDenied />,
    layout: '/orgs',
  },
];

export const userRoutes = [
  {
    redirect: true,
    path: '/my-profile',
    component: <MyProfile />,
    layout: '/user',
  },
  {
    redirect: true,
    path: '/mcp-server-settings',
    component: <AiSettings />,
    layout: '/user',
  },
];

export default routes;
