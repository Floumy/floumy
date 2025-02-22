import { Injectable } from '@nestjs/common';
import { OpenaiService } from './openai/openai.service';
import { InitiativeType, KeyResultType, WorkItemType } from './types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Initiative } from '../roadmap/initiatives/initiative.entity';
import { Issue } from '../issues/issue.entity';
import { KeyResult } from '../okrs/key-result.entity';
import { Milestone } from '../roadmap/milestones/milestone.entity';
import { FeatureRequest } from '../feature-requests/feature-request.entity';
import { TimelineService } from '../common/timeline.service';
import { Timeline } from '../common/timeline.enum';

@Injectable()
export class AiService {
  constructor(
    private openaiService: OpenaiService,
    @InjectRepository(Initiative)
    private initiativeRepository: Repository<Initiative>,
    @InjectRepository(Issue)
    private issueRepository: Repository<Issue>,
    @InjectRepository(KeyResult)
    private keyResultRepository: Repository<KeyResult>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(FeatureRequest)
    private featureRequestRepository: Repository<FeatureRequest>,
  ) {}

  async generateKeyResults(objective: string): Promise<KeyResultType[]> {
    const prompt = `Generate 2-4 key results for this objective:

      ${objective}
      
      Format each as a single line starting with a measurable verb:
      
      [Verb] [specific metric] [meaningful outcome]
      
      Examples:
      
      Increase customer satisfaction score to 90%
      
      Reduce system errors to fewer than 5 per week
      
      Achieve 98% uptime across all services
      
      Requirements: 
      • Include ONLY the most critical metrics that define success
      • Each KR must be necessary - if removed, objective fails
      • Start with actionable verbs (Increase, Reduce, Achieve, etc.) 
      • Include specific, measurable metrics 
      • Focus on outcomes, not activities 
      • Avoid timelines and costs 
      • Keep under 8 words per result 
      • Ensure each result directly supports the objective
      
      Choose metrics that are: 
      • Quantifiable 
      • Clear to measure 
      • Meaningful to stakeholders 
      • Within team's influence
      
      Favor fewer, high-impact results over many small ones.`;

    const response = await this.openaiService.generateCompletion<{
      keyResults: KeyResultType[];
    }>(prompt, {
      name: 'keyResults',
      schema: {
        type: 'object',
        properties: {
          keyResults: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
              },
              required: ['title'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['keyResults'],
        additionalProperties: false,
      },
    });
    return response.data.keyResults;
  }

  async generateInitiativesForOKR(objective: string, keyResult: string) {
    const prompt = `Generate 2-3 high-impact initiatives for this objective and key result:

    ${objective} ${keyResult}
    
    Format each initiative as:
    
    [Title]: Single clear phrase under 6 words 
    [Priority]: high/medium/low 
    [Description]: Structured HTML with 3 sections:
    
    • Goal: One sentence stating concrete desired outcome 
    • Rationale: Business value and strategic importance 
    • Impact: Specific, measurable success metrics
    
    Requirements: 
    • Each initiative must directly drive the key result 
    • Focus on outcomes over activities 
    • Include only essential initiatives - if removed, key result fails 
    • Ensure initiatives are within team's control 
    • Keep descriptions concise and actionable
    
    Choose initiatives that are: 
    • Clear to implement 
    • Measurable for success 
    • Meaningful to stakeholders 
    • Realistic with current resources
    
    Favor fewer, transformative initiatives over many incremental ones.
    
    Example format:
    
    Implement automated testing framework 
    Priority: high 
    <h3>Goal</h3> 
    <p>Create end-to-end test coverage for critical paths</p> 
    <h3>Rationale</h3> 
    <p>Prevents production issues and enables faster releases</p> 
    <h3>Impact</h3> 
    <p>95% test coverage of core workflows</p>`;

    const response = await this.openaiService.generateCompletion<{
      initiatives: InitiativeType[];
    }>(prompt, {
      name: 'initiatives',
      schema: {
        type: 'object',
        properties: {
          initiatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
              },
              required: ['title', 'description', 'priority'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['initiatives'],
        additionalProperties: false,
      },
    });
    return response.data.initiatives;
  }

  async generateInitiativesForFeatureRequest(
    featureRequest: string,
    featureRequestDescription: string,
  ) {
    const prompt = `Generate 1-3 high-impact initiatives for this feature request:

    Copy
    ${featureRequest}
    ${featureRequestDescription}
    
    Format each initiative as:
    
    [Title]: Single clear phrase under 6 words
    [Priority]: high/medium/low
    [Description]: Structured HTML with 3 sections:
    
    • Goal: One sentence stating concrete deliverable
    • Rationale: Business value and user impact
    • Outcome: Specific, measurable success criteria
    
    Requirements:
    • Each initiative must directly enable the feature
    • Focus on user value over technical details
    • Include only essential initiatives - if removed, feature fails
    • Ensure initiatives are technically feasible
    • Keep descriptions concise and actionable
    
    Choose initiatives that are:
    • Clear to implement
    • Measurable for success
    • Valuable to users
    • Realistic with current tech stack
    
    Favor fewer, complete initiatives over many partial ones.
    
    Example format:
    
    Implement user authentication flow
    Priority: high
    <h3>Goal</h3>
    <p>Create secure login system with email/password</p>
    <h3>Rationale</h3>
    <p>Enables user accounts and personalized experience</p>
    <h3>Outcome</h3>
    <p>90% of users can successfully register and login</p>
`;

    const response = await this.openaiService.generateCompletion<{
      initiatives: InitiativeType[];
    }>(prompt, {
      name: 'initiatives',
      schema: {
        type: 'object',
        properties: {
          initiatives: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
              },
              required: ['title', 'description', 'priority'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 3,
          },
        },
        required: ['initiatives'],
        additionalProperties: false,
      },
    });
    return response.data.initiatives;
  }

  async generateWorkItemsForInitiative(
    initiative: string,
    description: string,
  ) {
    const prompt = `Generate 2-4 essential work items for this initiative:

    Initiative: ${initiative}
    Description: ${description}
    
    Format each work item as:
    
    [Title]: 
    - For user stories: "As a [user], I want to [action], so that [benefit]"
    - For tasks/spikes: Clear action phrase under 6 words
    [Type]: user-story/task/spike
    [Priority]: high/medium/low
    [Description]: Structured HTML with sections:
    
    For user stories:
    • Goal: One sentence stating concrete deliverable
    • Value: Business impact and user benefit
    • Implementation: Key technical considerations and approach
    • Acceptance Criteria: Bulleted list of testable requirements

    For tasks/spikes:
    • Goal: One sentence describing the work
    • Acceptance Criteria: Bulleted list of completion requirements
    
    Requirements:
    • Each work item must be independently deliverable
    • Include only essential items - all directly enable initiative
    • Ensure items are technically feasible
    
    Work item types:
    • user-story: User-facing functionality written from user perspective
    • task: Technical work with no direct user impact
    • spike: Research/investigation activities
    
    Example formats:

    As a user, I want to customize the app's theme, so that I can make it more comfortable for my eyes
    Type: user-story
    Priority: high
    <h3>Goal</h3>
    <p>Enable users to switch between light and dark themes</p>
    <h3>Value</h3>
    <p>Improves user experience and accessibility for different lighting conditions</p>
    <h3>Implementation</h3>
    <p>Add theme toggle in user settings, implement CSS variables for theming</p>
    <h3>Acceptance Criteria</h3>
    <ul>
        <li>User can switch between light and dark themes in settings</li>
        <li>Theme preference persists across sessions</li>
        <li>All UI elements respect the selected theme</li>
        <li>Theme changes apply immediately without page reload</li>
        <li>Default theme matches system preferences</li>
    </ul>

    Configure CI pipeline for theme builds
    Type: task
    Priority: medium
    <h3>Goal</h3>
    <p>Set up automated build process for theme compilation</p>
    <h3>Acceptance Criteria</h3>
    <ul>
        <li>Theme files automatically compile on merge</li>
        <li>Build artifacts stored in correct location</li>
        <li>Failed builds trigger notifications</li>
    </ul>`;

    const response = await this.openaiService.generateCompletion<{
      workItems: WorkItemType[];
    }>(prompt, {
      name: 'workItems',
      schema: {
        type: 'object',
        properties: {
          workItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                type: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
              required: ['title', 'type', 'priority', 'description'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['workItems'],
        additionalProperties: false,
      },
    });
    return response.data.workItems;
  }

  async generateWorkItemsForIssue(issue: string, description: string) {
    const prompt = `Generate 1-3 essential work items for this issue:

    Issue: ${issue}
    Description: ${description}
    
    Format each work item as:
    
    [Title]:
    - For user stories: "As a [user], I want to [action], so that [benefit]"
    - For tasks/bugs/spikes: Clear action phrase under 6 words
    [Type]: task/bug/user-story/spike (prefer in this order)
    [Priority]: high/medium/low
    [Description]: Structured HTML with sections:
    
    For user stories:
    • Goal: One sentence stating concrete deliverable
    • Value: Business impact and user benefit
    • Implementation: Key technical considerations and approach
    • Acceptance Criteria: Bulleted list of testable requirements

    For tasks/bugs/spikes:
    • Goal: One sentence describing the work
    • Acceptance Criteria: Bulleted list of completion requirements
    
    Requirements:
    • Each work item must be independently deliverable
    • Include only essential items to resolve the issue
    • Ensure items are technically feasible
    
    Work item types:
    • task: Technical work with no direct user impact
    • bug: Fix for broken functionality
    • user-story: User-facing functionality written from user perspective
    • spike: Research/investigation activities
    
    Example formats:

    Fix memory leak in theme switcher
    Type: bug
    Priority: high
    <h3>Goal</h3>
    <p>Resolve memory leak when switching themes repeatedly</p>
    <h3>Acceptance Criteria</h3>
    <ul>
        <li>Memory usage stable after 100+ theme switches</li>
        <li>No DOM elements remain after component unmount</li>
        <li>Performance profiling shows no memory growth</li>
    </ul>

    As a user, I want to reset my theme to default, so that I can easily restore standard appearance
    Type: user-story
    Priority: medium
    <h3>Goal</h3>
    <p>Provide option to reset theme customizations</p>
    <h3>Value</h3>
    <p>Allows users to easily recover from unwanted theme changes</p>
    <h3>Implementation</h3>
    <p>Add reset button to theme settings, restore default values</p>
    <h3>Acceptance Criteria</h3>
    <ul>
        <li>Reset button visible in theme settings</li>
        <li>Clicking reset restores all default values</li>
        <li>Confirmation dialog prevents accidental reset</li>
        <li>User receives feedback when reset completes</li>
    </ul>`;

    const response = await this.openaiService.generateCompletion<{
      workItems: WorkItemType[];
    }>(prompt, {
      name: 'workItems',
      schema: {
        type: 'object',
        properties: {
          workItems: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                type: {
                  type: 'string',
                },
                priority: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
              },
              required: ['title', 'type', 'priority', 'description'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['workItems'],
        additionalProperties: false,
      },
    });
    return response.data.workItems;
  }

  async generateWorkItemDescription(
    workItem: string,
    workItemType: string,
    initiativeId: string,
    issueId: string,
  ) {
    let prompt = `Generate a detailed description for this work item:
    
    Work Item Title: ${workItem}
    Work Item Type: ${workItemType}
    `;
    if (initiativeId) {
      const initiative = await this.initiativeRepository.findOneOrFail({
        where: { id: initiativeId },
      });
      prompt += `Linked Initiative title: ${initiative.title}
      Linked Initiative description: ${initiative.description}
      `;
    }
    if (issueId) {
      const issue = await this.issueRepository.findOneOrFail({
        where: { id: issueId },
      });
      prompt += `Linked Issue title: ${issue.title}
      Linked Issue description: ${issue.description}
      `;
    }
    prompt += `
    Format the description based on work item type:

    For user stories:
    • Goal: One sentence stating concrete deliverable
    • Value: Business impact and user benefit
    • Implementation: Key technical considerations and approach
    • Acceptance Criteria: Bulleted list of testable requirements
    
    For tasks/bugs/spikes:
    • Goal: One sentence describing the work
    • Acceptance Criteria: Bulleted list of completion requirements
    
    Work item types:
    • user-story: User-facing functionality written from user perspective
    • task: Technical work with no direct user impact
    • bug: Fix for broken functionality
    • spike: Research/investigation activities
    
    Requirements:
    • Focus on concrete, measurable outcomes
    • Include only essential implementation details
    • Write clear, testable acceptance criteria
    • Align with linked initiative/issue goals
    
    Example formats:
    
    User Story Example:
    <h3>Goal</h3>
    <p>Enable users to export dashboard data to multiple formats</p>
    <h3>Value</h3>
    <p>Allows users to analyze data in their preferred tools</p>
    <h3>Implementation</h3>
    <p>Add export options for CSV, PDF, and Excel using DataExport library</p>
    <h3>Acceptance Criteria</h3>
    <ul>
        <li>Export button available in dashboard header</li>
        <li>User can select from three format options</li>
        <li>Export completes within 5 seconds for standard datasets</li>
        <li>Downloaded files contain all visible dashboard data</li>
    </ul>
    
    Task/Bug/Spike Example:
    <h3>Goal</h3>
    <p>Implement rate limiting for export API endpoints</p>
    <h3>Acceptance Criteria</h3>
    <ul>
        <li>Maximum 5 exports per minute per user</li>
        <li>Appropriate error message on limit exceeded</li>
        <li>Logging of all rate limit events</li>
    </ul>
    `;

    const response = await this.openaiService.generateCompletion<{
      description: string;
    }>(prompt, {
      name: 'workItemDescription',
      schema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
          },
        },
        required: ['description'],
        additionalProperties: false,
      },
    });
    return response.data.description;
  }

  async generateInitiativeDescription(
    initiative: string,
    keyResultId: string,
    milestoneId: string,
    featureRequestId: string,
  ) {
    let prompt = `Generate a detailed description for this initiative:
    Initiative Title: ${initiative}
    `;

    if (keyResultId) {
      const keyResult = await this.keyResultRepository.findOneOrFail({
        where: { id: keyResultId },
      });
      prompt += `Linked Key Result: ${keyResult.title}\n`;
    }

    if (milestoneId) {
      const milestone = await this.milestoneRepository.findOneOrFail({
        where: { id: milestoneId },
      });
      prompt += `Linked Milestone: ${milestone.title}\n`;
    }

    if (featureRequestId) {
      const featureRequest = await this.featureRequestRepository.findOneOrFail({
        where: { id: featureRequestId },
      });
      prompt += `Linked Feature Request: ${featureRequest.title}
      Description: ${featureRequest.description}\n`;
    }

    prompt += `
    Format the description as structured HTML with 3 sections:
    
    <h3>Goal</h3>
    <p>Single sentence stating the concrete deliverable</p>
    
    <h3>Rationale</h3>
    <p>Business value and user impact</p>
    
    <h3>Outcome</h3>
    <p>Specific, measurable success criteria</p>
    
    Requirements:
    • Focus on user value over technical details
    • Keep descriptions concise and actionable
    • Include clear success metrics
    • Ensure technical feasibility
    
    The description should be:
    • Clear and implementable
    • Tied to measurable outcomes
    • Focused on user/business value
    • Realistic within current capabilities
    `;

    const response = await this.openaiService.generateCompletion<{
      description: string;
    }>(prompt, {
      name: 'initiativeDescription',
      schema: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
          },
        },
        required: ['description'],
        additionalProperties: false,
      },
    });
    return response.data.description;
  }

  async generateRoadmapMilestonesForTimeline(
    orgId: string,
    projectId: string,
    timeline: string,
  ) {
    if (
      !timeline ||
      [Timeline.PAST.valueOf(), Timeline.LATER.valueOf()].includes(timeline)
    ) {
      return [];
    }

    const { startDate, endDate } =
      TimelineService.getStartAndEndDatesByTimelineValue(timeline);

    const initiatives = await this.initiativeRepository
      .createQueryBuilder('initiative')
      .leftJoinAndSelect('initiative.keyResult', 'keyResult')
      .leftJoinAndSelect('keyResult.objective', 'objective')
      .leftJoin('initiative.milestone', 'milestone')
      .where('milestone.id IS NULL')
      .andWhere('objective.startDate >= :startDate', { startDate })
      .andWhere('objective.endDate <= :endDate', { endDate })
      .andWhere('initiative.orgId = :orgId', { orgId })
      .andWhere('initiative.projectId = :projectId', { projectId })
      .select(['initiative.id', 'initiative.title', 'initiative.description'])
      .getMany();

    if (initiatives.length === 0) {
      return [];
    }

    const prompt = `Generate up to 5 roadmap milestones for the following initiatives.
    Each milestone should be a clear, functional deliverable that moves the project forward.
      •	Organize milestones sequentially, considering initiative dependencies.
      •	Group related initiatives together when possible to minimize the number of milestones.
      •	Ensure each milestone represents a meaningful step towards usability (e.g., “First working version of X”).
      •	Prefer delivering working functionality rather than isolated backend or frontend tasks.
    
    Constraints:
      •	Start Date: ${startDate}
      •	End Date: ${endDate}
    
    Input Initiatives (JSON format):
    
    ${JSON.stringify(initiatives)}
    
    Each initiative object has the following structure:
    
    {
      "id": 101,
      "title": "User Authentication",
      "description": "Allow users to sign up, log in, and reset passwords.",
    }
    
    Instructions for Initiative Selection in Milestones:
      1.	Prioritize initiatives with no dependencies in earlier milestones.
      2.	Unlock dependent initiatives by placing prerequisite initiatives in earlier milestones.
      3.	Group logically connected initiatives in the same milestone (e.g., “User Authentication” and “User Profile Setup”).
      4.	Avoid breaking initiatives into unnecessary steps unless they are too large for one milestone.
      5.	Assign the correct initiative IDs from the provided input when defining milestones.
      6.  Make sure to include all initiatives provided in the input.
    
    For Each Milestone, Return:
      •	Title: Concise and descriptive milestone name.
      •	Description: What will be achieved? Be specific.
      •	Due Date: A realistic due date within the given range.
      •	Initiative IDs: A list of initiative IDs that should be completed in this milestone.
    
    Example of Well-Structured Milestones:
    
    [
      {
        "title": "Core Authentication & User Setup",
        "description": "Implement user authentication, account creation, and basic profile setup.",
        "due_date": "YYYY-MM-DD",
        "initiative_ids": [101, 102, 103]
      },
      {
        "title": "Project Management Basics",
        "description": "Enable project creation, task assignment, and basic collaboration tools.",
        "due_date": "YYYY-MM-DD",
        "initiative_ids": [201, 202, 204]
      }
    ]
    
    🚫 Avoid vague milestones like:
    ❌ “Start working on X”
    ❌ “General improvements”
    ❌ “Polish UI”`;

    const response = await this.openaiService.generateCompletion<{
      milestones: {
        title: string;
        description: string;
        dueDate: string;
        initiativeIds: string[];
      }[];
    }>(prompt, {
      name: 'milestones',
      schema: {
        type: 'object',
        properties: {
          milestones: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                dueDate: {
                  type: 'string',
                },
                initiativeIds: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
              required: ['title', 'description', 'dueDate', 'initiativeIds'],
              additionalProperties: false,
            },
            minItems: 1,
            maxItems: 5,
          },
        },
        required: ['milestones'],
        additionalProperties: false,
      },
    });

    return response.data.milestones;
  }
}
