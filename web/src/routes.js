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
import BuildInPublic from './views/pages/settings/BuildInPublic';
import PublicRoadmap from './views/pages/roadmap/PublicRoadmap';
import { PublicDetailInitiative } from './views/pages/initiatives/PublicDetailInitiative';
import PublicDetailWorkItem from './views/pages/backlog/PublicDetailWorkItem';
import PublicOKRs from './views/pages/okrs/PublicOKRs';
import PublicDetailOKR from './views/pages/okrs/PublicDetailOKR';
import PublicDetailKeyResult from './views/pages/okrs/PublicDetailKeyResult';
import PublicSprints from './views/pages/sprints/PublicSprints';
import PublicSprint from './views/pages/sprints/PublicSprint';
import PublicMilestone from './views/pages/roadmap/PublicMilestone';
import PublicActiveSprint from './views/pages/development/PublicActiveSprint';
import Project from './views/pages/settings/Project';
import MyProfile from './views/pages/users/MyProfile';
import PrivateFeed from './views/pages/feed/PrivateFeed';
import PublicFeed from './views/pages/feed/PublicFeed';
import SignUp from './views/pages/auth/SignUp';
import FeatureRequests from './views/pages/feature-requests/FeatureRequests';
import NewFeatureRequest from './views/pages/feature-requests/NewFeatureRequest';
import EditFeatureRequest from './views/pages/feature-requests/EditFeatureRequest';
import FeatureRequestDetails from './views/pages/feature-requests/FeatureRequestDetails';
import Issues from './views/pages/issues/Issues';
import NewIssue from './views/pages/issues/NewIssue';
import EditIssue from './views/pages/issues/EditIssue';
import IssueDetails from './views/pages/issues/IssueDetails';
import Code from './views/pages/code/Code';
import GitHub from './views/pages/code/GitHub';
import GitLab from './views/pages/code/GitLab';
import Projects from './views/pages/orgs/projects/Projects';

const routes = [
  {
    redirect: true,
    path: "/dashboard",
    component: <OKRs />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/feature-requests",
    component: <FeatureRequests />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/feature-requests/new",
    component: <NewFeatureRequest />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/feature-requests/edit/:featureRequestId",
    component: <EditFeatureRequest />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/issues",
    component: <Issues />,
    layout: "/admin"
  },
  { redirect: true, path: "/issues/new", component: <NewIssue />, layout: "/admin" },
  {
    redirect: true,
    path: "/issues/edit/:issueId",
    component: <EditIssue />,
    layout: "/admin"
  },
  {
    collapse: false,
    name: "Feed",
    icon: "fa fa-newspaper",
    path: "/feed",
    component: <PrivateFeed />,
    layout: "/admin",
    shortcut: "1"
  },
  {
    collapse: false,
    name: "Objectives",
    icon: "fa fa-bullseye",
    path: "/okrs",
    component: <OKRs />,
    layout: "/admin",
    shortcut: "2"
  },
  {
    redirect: true,
    path: "/roadmap",
    component: <InitiativesRoadmap />,
    layout: "/admin",
    shortcut: "3"
  },
  {
    redirect: true,
    path: "/roadmap/initiatives/new",
    component: <NewInitiative />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/roadmap/initiatives/detail/:id",
    component: <DetailInitiative />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/roadmap/milestones/new",
    component: <NewMilestone />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/roadmap/milestones/edit/:id",
    component: <EditMilestone />,
    layout: "/admin"
  },
  {
    redirect: true,
    name: "New Work Item",
    path: "/work-item/new",
    component: <NewWorkItem />,
    layout: "/admin"
  },
  {
    redirect: true,
    name: "Edit Work Item",
    path: "/work-item/edit/:id",
    component: <EditWorkItem />,
    layout: "/admin"
  },
  {
    collapse: false,
    name: "Sprints",
    icon: "fa fa-refresh",
    path: "/sprints",
    component: <Sprints />,
    layout: "/admin",
    shortcut: "4"
  },
  {
    redirect: true,
    path: "/sprints/new",
    component: <NewSprint />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/sprints/edit/:id",
    component: <EditSprint />,
    layout: "/admin"
  },
  {
    collapse: false,
    name: "Active Sprint",
    icon: "fa fa-rocket",
    path: "/active-sprint",
    component: <ActiveSprint />,
    layout: "/admin",
    shortcut: "5"
  },
  {
    collapse: false,
    name: "All Work Items",
    icon: "fa fa-tasks",
    path: "/work-items",
    component: <WorkItems />,
    layout: "/admin",
    shortcut: "6"
  },
  {
    collapse: false,
    name: "All Initiatives",
    icon: "fa fa-list-alt",
    path: "/initiatives",
    component: <Initiatives />,
    layout: "/admin",
    shortcut: "7"
  },
  {
    redirect: true,
    path: "/okrs/new",
    component: <NewOKR />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/okrs/detail/:id",
    component: <DetailOKR />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/kr/detail/:keyResultId",
    component: <DetailKeyResult />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/build-in-public",
    component: <BuildInPublic />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/project",
    component: <Project />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/my-profile",
    component: <MyProfile />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/sign-in",
    component: <SignIn />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/sign-up",
    component: <OrgSignUp />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/simple/sign-up",
    component: <SignUp />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/forgot-password",
    component: <ForgotPassword />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/reset-password",
    component: <ResetPassword />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/reset-email-sent",
    component: <ResetEmailSent />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/password-reset",
    component: <PasswordReset />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/activation",
    component: <Activation />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/activation-required",
    component: <ActivationRequired />,
    layout: "/auth"
  },
  {
    redirect: true,
    path: "/members",
    component: <Members />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/code",
    component: <Code />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/code/github",
    component: <GitHub />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/code/gitlab",
    component: <GitLab />,
    layout: "/admin"
  }
];

export const publicRoutes = [
  {
    redirect: true,
    path: "/roadmap",
    component: <PublicRoadmap />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/roadmap/initiatives/detail/:initiativeId",
    component: <PublicDetailInitiative />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/work-item/detail/:workItemId",
    component: <PublicDetailWorkItem />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/objectives",
    component: <PublicOKRs />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/okrs/detail/:okrId",
    component: <PublicDetailOKR />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/kr/detail/:keyResultId",
    component: <PublicDetailKeyResult />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/sprints",
    component: <PublicSprints />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/sprints/detail/:sprintId",
    component: <PublicSprint />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/milestones/detail/:milestoneId",
    component: <PublicMilestone />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/active-sprint",
    component: <PublicActiveSprint />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/feed",
    component: <PublicFeed />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/feature-requests",
    component: <FeatureRequests isPublic={true} />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/issues",
    component: <Issues isPublic={true} />,
    layout: "/public"
  },
  { redirect: true, path: "/issues/new", component: <NewIssue />, layout: "/public" },
  {
    redirect: true,
    path: "/feature-requests/new",
    component: <NewFeatureRequest />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/feature-requests/:featureRequestId",
    component: <FeatureRequestDetails />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/issues/:issueId",
    component: <IssueDetails />,
    layout: "/public"
  }
];

export const orgsRoutes = [
  {
    redirect: true,
    path: "/projects",
    component: <Projects />,
    layout: "/orgs"
  },
  {
    redirect: true,
    path: "/members",
    component: <Members />,
    layout: "/orgs"
  }
]

export default routes;
