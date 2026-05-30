export const generateLatex = (blocks: any[]) => {
  let content = '';

  blocks.forEach((block) => {
    switch (block.type) {
      case 'header':
        content += `\\header{${block.data.title}}{${block.data.subtitle}}{${block.data.instructor}}\n\n`;
        break;
      case 'section':
        content += `\\section*{${block.data.title}}\n\n`;
        break;
      case 'paragraph':
        content += `${block.data.content}\n\n`;
        break;
      case 'notebox':
        content += `\\begin{notebox}[${block.data.title}]\n${block.data.content}\n\\end{notebox}\n\n`;
        break;
      case 'warnbox':
        content += `\\begin{warnbox}[${block.data.title}]\n${block.data.content}\n\\end{warnbox}\n\n`;
        break;
      case 'examplebox':
        content += `\\begin{examplebox}[${block.data.title}]\n${block.data.content}\n\\end{examplebox}\n\n`;
        break;
      default:
        break;
    }
  });

  return content;
};
