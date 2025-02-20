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
    const prompt = `Generate up to 5 work items for the following initiative:
    
    Initiative: ${initiative}
    Description: ${description}
    
    For each work item, include:
    - Title
    - Type (user-story/task/spike)
    - Priority (high/medium/low)
    - Description
    
    Prefer to use the following types in this order: user-story, task, spike
    
    As much as possible, slice the work items so that they are not dependent on each other.
        
    The user story type should be used for work items that are about a job that needs to be done by a user.
    The task type should be used for work items that are about a task that is not a user story.
    The bug type should be used for work items that are about a something that is broken.
    The spike type should be used for work items that are about investigating an idea or a concept.
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
    Have a preference for a lower number of key results.
    
    Format the description as an HTML string.
    `;

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
    const prompt = `Generate up to 3 work items for the following issue:
    
    Issue: ${issue}
    Description: ${description}

    For each work item, include:
    - Title
    - Type (user-story/task/bug/spike)
    - Priority (high/medium/low)
    - Description
    
    Prefer to use the following types in this order: task, bug, user-story, spike
    
    As much as possible, slice the work items so that they are not dependent on each other.
        
    The user story type should be used for work items that are about a job that needs to be done by a user.
    The task type should be used for work items that are about a task that is not a user story.
    The bug type should be used for work items that are about a something that is broken.
    The spike type should be used for work items that are about investigating an idea or a concept.
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
    Have a preference for a lower number of key results.
    
    Format the description as an HTML string.
    `;

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
    let prompt = `Generate a description for the following work item:
    
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
    The user story type should be used for work items that are about a job that needs to be done by a user.
    The task type should be used for work items that are about a task that is not a user story.
    The bug type should be used for work items that are about a something that is broken.
    The spike type should be used for work items that are about investigating an idea or a concept.
    
    In the description, include:
    - What is the goal of the work item?
    - Why is it important?
    - Implementation details
    - Acceptance criteria
    
    Separate the description into sections, each with a heading.
    
    Format the description as an HTML string.
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
    let prompt = `Generate a description for the following initiative:
    
    Initiative Title: ${initiative}
    `;
    if (keyResultId) {
      const keyResult = await this.keyResultRepository.findOneOrFail({
        where: { id: keyResultId },
      });
      prompt += `Linked Key Result title: ${keyResult.title}
      `;
    }
    if (milestoneId) {
      const milestone = await this.milestoneRepository.findOneOrFail({
        where: { id: milestoneId },
      });
      prompt += `Linked Milestone title: ${milestone.title}
      `;
    }
    if (featureRequestId) {
      const featureRequest = await this.featureRequestRepository.findOneOrFail({
        where: { id: featureRequestId },
      });
      prompt += `Linked Feature Request title: ${featureRequest.title}
      Linked Feature Request description: ${featureRequest.description}
      `;
    }
    prompt += `
    In the description, include:
    - What is the goal of the initiative?
    - Why is it important?
    - What is the expected outcome of the initiative?
   
    Separate the description into sections, each with a heading.
    
    Format the description as an HTML string.
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
