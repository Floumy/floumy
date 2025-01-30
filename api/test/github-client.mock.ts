export const githubClientMock = {
  rest: {
    users: {
      getAuthenticated: jest.fn().mockImplementation(() => {
        return {
          data: {
            login: 'thelexned',
            id: 66918833,
            node_id: 'MDQ6VXNlcjY2OTE4ODMz',
            avatar_url: 'https://avatars.githubusercontent.com/u/66918833?v=4',
            gravatar_id: '',
            url: 'https://api.github.com/users/thelexned',
            html_url: 'https://github.com/thelexned',
            followers_url: 'https://api.github.com/users/thelexned/followers',
            following_url: 'https://api.github.com/users/thelexned/following{/other_user}',
            gists_url: 'https://api.github.com/users/thelexned/gists{/gist_id}',
            starred_url: 'https://api.github.com/users/thelexned/starred{/owner}{/repo}',
            subscriptions_url: 'https://api.github.com/users/thelexned/subscriptions',
            organizations_url: 'https://api.github.com/users/thelexned/orgs',
            repos_url: 'https://api.github.com/users/thelexned/repos',
            events_url: 'https://api.github.com/users/thelexned/events{/privacy}',
            received_events_url: 'https://api.github.com/users/thelexned/received_events',
            type: 'User',
            site_admin: false,
            name: 'Alexandru Nedelcu',
            company: 'x',
            blog: '',
            location: null,
            email: null,
            hireable: null,
            bio: null,
            twitter_username: null,
            public_repos: 13,
            public_gists: 1,
            followers: 1,
            following: 1,
            created_at: '2020-06-14T18:11:50Z',
            updated_at: '2025-01-10T20:27:41Z',
          },
        };
      }),
    },
    repos: {
      listForAuthenticatedUser: jest.fn().mockImplementation(() => {
        return {
          data: [
            {
              id: 1,
              node_id: 'MDEwOlJlcG9zaXRvcnkx',
              name: 'test',
              full_name: 'test',
              private: true,
              owner: {
                login: 'thelexned',
                id: 66918833,
                node_id: 'MDQ6VXNlcjY2OTE4ODMz',
                avatar_url: 'https://avatars.githubusercontent.com/u/66918833?v=4',
                gravatar_id: '',
                url: 'https://api.github.com/users/thelexned',
                html_url: 'https://github.com/thelexned',
                followers_url: 'https://api.github.com/users/thelexned/followers',
              },
            },
          ],
        };
      }),
      createWebhook: jest.fn().mockImplementation(() => {
        return {
          data: {
            id: 1,
            url: 'https://api.github.com/repos/thelexned/floumy/hooks/1',
            test_url: 'https://api.github.com/repos/thelexned/floumy/hooks/1/test',
            ping_url: 'https://api.github.com/repos/thelexned/floumy/hooks/1/pings',
            name: 'web',
            events: ['push', 'pull_request'],
            active: true,
            config: {
              content_type: 'json',
              insecure_ssl: '0',
              url: 'https://api.github.com/repos/thelexned/floumy/hooks/1',
              secret: 'secret',
            },
            last_response: {
              code: null,
              status: 'unused',
              message: null,
            },
          },
        };
      }),
      deleteWebhook: jest.fn().mockImplementation(() => {
        return {
          data: {},
        };
      }),
    },
  },
  request: jest.fn().mockImplementation((path: string, params: any) => {
    if (path === 'GET /repositories/:id') {
      return {
        data: {
          id: params.id,
          name: 'test-repo',
          full_name: 'thelexned/test-repo',
          owner: {
            login: 'thelexned',
          },
        },
      };
    }
    if (path === 'GET /repos/:owner/:repo/pulls') {
      return {
        data: [
          {
            id: 1,
            title: 'Test PR WI-123',
            html_url: 'https://github.com/test/test/pull/1',
            state: 'open',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            head: {
              ref: 'feature/WI-123-test-branch'
            }
          }
        ],
      };
    }
    if (path === 'DELETE /repos/:owner/:repo/hooks/:hook_id') {
      return {
        data: {},
      };
    }
    return {
      data: {},
    };
  }),
  auth: {
    github: {
      callbackUrl: 'https://example.com/auth/github/callback',
    },
  },
};