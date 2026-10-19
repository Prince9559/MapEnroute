export const cleanAIMarkdown = (rawText) => {
  if (!rawText) return '';

  return rawText
    // LaTeX arrows ko clean Unicode arrow me convert karein
    .replace(/\$\\rightarrow\$/g, '➔')
    .replace(/\\rightarrow/g, '➔')
    .replace(/\$/g, '') // Bachha hua koi bhi $ symbol hatayein
    // Markdown headers (###, ##, #) clean karein
    .replace(/^#{1,6}\s+/gm, '')
    // Bold aur italic asterisks (**, *) hatayein
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    // Horizontal line dashes hatayein
    .replace(/---/g, '')
    // Asterisk bullets (*) ko neat bullet me badlein
    .replace(/^\s*\*\s+/gm, '• ')
    // Multiple blank lines ko tidy karein
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};