
import OKRs from "./views/pages/okrs/OKRs";
import NewOKR from "./views/pages/okrs/NewOKR";
import DetailOKR from "./views/pages/okrs/DetailOKR";
import SignIn from "./views/pages/auth/SignIn";
import OrgSignUp from "./views/pages/auth/OrgSignUp";
import InitiativesRoadmap from "./views/pages/roadmap/InitiativesRoadmap";
import ActiveIteration from "./views/pages/development/ActiveIteration";
import NewFeature from "./views/pages/roadmap/NewFeature";
import NewMilestone from "./views/pages/roadmap/NewMilestone";
import EditMilestone from "./views/pages/roadmap/EditMilestone";
import EditFeature from "./views/pages/features/EditFeature";
import NewWorkItem from "./views/pages/backlog/NewWorkItem";
import EditWorkItem from "./views/pages/backlog/EditWorkItem";
import { DetailFeature } from "./views/pages/features/DetailFeature";
import Iterations from "./views/pages/iterations/Iterations";
import WorkItems from "./views/pages/backlog/WorkItems";
import NewIteration from "./views/pages/iterations/NewIteration";
import EditIteration from "./views/pages/iterations/EditIteration";
import Features from "./views/pages/features/Features";
import DetailKeyResult from "./views/pages/okrs/DetailKeyResult";
import Members from "./views/pages/settings/Members";
import ActivationRequired from "./views/pages/auth/ActivationRequired";
import Activation from "./views/pages/auth/Activation";
import ForgotPassword from "./views/pages/auth/ForgotPassword";
import ResetPassword from "./views/pages/auth/ResetPassword";
import ResetEmailSent from "./views/pages/auth/ResetEmailSent";
import PasswordReset from "./views/pages/auth/PasswordReset";
import BuildInPublic from "./views/pages/settings/BuildInPublic";
import PublicRoadmap from "./views/pages/roadmap/PublicRoadmap";
import { PublicDetailFeature } from "./views/pages/features/PublicDetailFeature";
import PublicDetailWorkItem from "./views/pages/backlog/PublicDetailWorkItem";
import PublicOKRs from "./views/pages/okrs/PublicOKRs";
import PublicDetailOKR from "./views/pages/okrs/PublicDetailOKR";
import PublicDetailKeyResult from "./views/pages/okrs/PublicDetailKeyResult";
import PublicIterations from "./views/pages/iterations/PublicIterations";
import PublicIteration from "./views/pages/iterations/PublicIteration";
import PublicMilestone from "./views/pages/roadmap/PublicMilestone";
import PublicActiveIteration from "./views/pages/development/PublicActiveIteration";
import Project from "./views/pages/settings/Project";
import MyProfile from "./views/pages/users/MyProfile";
import PrivateFeed from "./views/pages/feed/PrivateFeed";
import PublicFeed from "./views/pages/feed/PublicFeed";
import SignUp from "./views/pages/auth/SignUp";
import FeatureRequests from "./views/pages/feature-requests/FeatureRequests";
import NewFeatureRequest from "./views/pages/feature-requests/NewFeatureRequest";
import EditFeatureRequest from "./views/pages/feature-requests/EditFeatureRequest";
import FeatureRequestDetails from "./views/pages/feature-requests/FeatureRequestDetails";
import Issues from "./views/pages/issues/Issues";
import NewIssue from "./views/pages/issues/NewIssue";
import EditIssue from "./views/pages/issues/EditIssue";
import IssueDetails from "./views/pages/issues/IssueDetails";

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
    path: "/roadmap/features/new",
    component: <NewFeature />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/roadmap/features/edit/:id",
    component: <EditFeature />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/roadmap/features/detail/:id",
    component: <DetailFeature />,
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
    path: "/iterations",
    component: <Iterations />,
    layout: "/admin",
    shortcut: "4"
  },
  {
    redirect: true,
    path: "/iterations/new",
    component: <NewIteration />,
    layout: "/admin"
  },
  {
    redirect: true,
    path: "/iterations/edit/:id",
    component: <EditIteration />,
    layout: "/admin"
  },
  {
    collapse: false,
    name: "Active Sprint",
    icon: "fa fa-rocket",
    path: "/active-iteration",
    component: <ActiveIteration />,
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
    path: "/features",
    component: <Features />,
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
    path: "/okrs/:objectiveId/kr/detail/:keyResultId",
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
    path: "/members",
    component: <Members />,
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
  }
];

export const publicRoutes = [
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/roadmap",
    component: <PublicRoadmap />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/roadmap/features/detail/:featureId",
    component: <PublicDetailFeature />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/work-item/detail/:workItemId",
    component: <PublicDetailWorkItem />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/objectives",
    component: <PublicOKRs />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/okrs/detail/:okrId",
    component: <PublicDetailOKR />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/objectives/:objectiveId/kr/detail/:keyResultId",
    component: <PublicDetailKeyResult />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/iterations",
    component: <PublicIterations />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/iterations/detail/:iterationId",
    component: <PublicIteration />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/milestones/detail/:milestoneId",
    component: <PublicMilestone />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/active-iteration",
    component: <PublicActiveIteration />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/feed",
    component: <PublicFeed />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/feature-requests",
    component: <FeatureRequests isPublic={true} />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/issues",
    component: <Issues isPublic={true} />,
    layout: "/public"
  },
  { redirect: true, path: "/orgs/:orgId/projects/:projectId/issues/new", component: <NewIssue />, layout: "/public" },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/feature-requests/new",
    component: <NewFeatureRequest />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/feature-requests/:featureRequestId",
    component: <FeatureRequestDetails />,
    layout: "/public"
  },
  {
    redirect: true,
    path: "/orgs/:orgId/projects/:projectId/issues/:issueId",
    component: <IssueDetails />,
    layout: "/public"
  }
];

export default routes;
