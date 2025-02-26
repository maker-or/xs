export function formatResponse(rawResponse: string): string {
  // Split the response into sections based on the markdown headers
  const sections = rawResponse.split('---');

  // Initialize the formatted response
  let formattedResponse = '';

  // Process each section
  sections.forEach(section => {
    // Split the section into lines
    const lines = section.split('\n');

    // Process each line
    lines.forEach(line => {
      // Handle LaTeX expressions
      line = line.replace(/\\\(([^\\]+)\\\)/g, (match, p1) => `$${p1}$`);
      line = line.replace(/\\\[([^\\]+)\\\]/g, (match, p1) => `$$${p1}$$`);

      // Add the formatted line to the response
      formattedResponse += line + '\n';
    });

    // Add a separator between sections
    formattedResponse += '\n';
  });

  return formattedResponse;
}
