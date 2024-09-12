export class IssueMapper {
  static toDto(issue: any) {
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      createdAt: issue.createdAt,
      updatedAt: issue.updatedAt,
    };
  }
}
