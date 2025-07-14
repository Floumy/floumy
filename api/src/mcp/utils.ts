export function entityNotFound(entity: string) {
  return {
    content: [
      {
        type: 'text',
        text: `I could not find any ${entity} with the provided details. Please check the information and try again.`,
      },
    ],
  };
}
