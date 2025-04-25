export interface CreateDemoDto {
  objectives: {
    title: string;
    keyResults: {
      title: string;
      initiatives: {
        title: string;
        description: string;
        priority: string;
        workItems: {
          title: string;
          type: string;
          priority: string;
          description: string;
        }[];
      }[];
    }[];
  }[];
}
