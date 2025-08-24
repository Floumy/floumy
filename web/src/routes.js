import OKRs from './views/pages/okrs/OKRs';
import NewOKR from './views/pages/okrs/NewOKR';
import DetailOKR from './views/pages/okrs/DetailOKR';
import SignIn from './views/pages/auth/SignIn';
import OrgSignUp from './views/pages/auth/OrgSignUp';
import InitiativesRoadmap from './views/pages/roadmap/InitiativesRoadmap';
import ActiveSprint from './views/pages/development/ActiveSprint';
import NewInitiative from './views/pages/roadmap/NewInitiative';
import NewMilestone from './views/pages/roadmap/NewMilestone';
import EditMilestone from './views/pages/roadmap/EditMilestone';
import NewWorkItem from './views/pages/backlog/NewWorkItem';
import EditWorkItem from './views/pages/backlog/EditWorkItem';
import { DetailInitiative } from './views/pages/initiatives/DetailInitiative';
import Sprints from './views/pages/sprints/Sprints';
import WorkItems from './views/pages/backlog/WorkItems';
import NewSprint from './views/pages/sprints/NewSprint';
import EditSprint from './views/pages/sprints/EditSprint';
import Initiatives from './views/pages/initiatives/Initiatives';
import DetailKeyResult from './views/pages/okrs/DetailKeyResult';
import Members from './views/pages/settings/Members';
import ActivationRequired from './views/pages/auth/ActivationRequired';
import Activation from './views/pages/auth/Activation';
import ForgotPassword from './views/pages/auth/ForgotPassword';
import ResetPassword from './views/pages/auth/ResetPassword';
import ResetEmailSent from './views/pages/auth/ResetEmailSent';
import PasswordReset from './views/pages/auth/PasswordReset';
import Project from './views/pages/settings/Project';
import MyProfile from './views/pages/users/MyProfile';
import SignUp from './views/pages/auth/SignUp';
import FeatureRequests from './views/pages/feature-requests/FeatureRequests';
import NewFeatureRequest from './views/pages/feature-requests/NewFeatureRequest';
import EditFeatureRequest from './views/pages/feature-requests/EditFeatureRequest';
import Issues from './views/pages/issues/Issues';
import NewIssue from './views/pages/issues/NewIssue';
import EditIssue from './views/pages/issues/EditIssue';
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
    path: '/feature-requests',
    component: <FeatureRequests />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/feature-requests/new',
    component: <NewFeatureRequest />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/feature-requests/edit/:featureRequestId',
    component: <EditFeatureRequest />,
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
    name: 'Sprints',
    icon: 'fa fa-refresh',
    path: '/sprints',
    component: <Sprints />,
    layout: '/admin',
    shortcut: '4',
  },
  {
    redirect: true,
    path: '/sprints/new',
    component: <NewSprint />,
    layout: '/admin',
  },
  {
    redirect: true,
    path: '/sprints/edit/:id',
    component: <EditSprint />,
    layout: '/admin',
  },
  {
    collapse: false,
    name: 'Active Sprint',
    icon: 'fa fa-rocket',
    path: '/active-sprint',
    component: <ActiveSprint />,
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
    path: '/ai-settings',
    component: <AiSettings />,
    layout: '/user',
  },
];

export default routes;
