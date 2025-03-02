export interface MergeRequestEvent {
  object_kind: 'merge_request';
  object_attributes: {
    state: string;
    action: string;
    title: string;
    description: string;
    source_branch: string;
    target_branch: string;
    url: string;
  };
  project: {
    id: number;
    name: string;
  };
}

export interface PushEvent {
  ref: string; // refs/heads/branch-name
  before: string;
  after: string;
  project_id: number;
  project: {
    name: string;
  };
}
