export const generateLatex = (blocks: any[]) => {
  let content = '';

  const renderInnerBlocks = (items: any[]) => {
    let innerContent = '';
    items.forEach((item) => {
      if (item.type === 'paragraph') {
        innerContent += `${item.data.content}\n\n`;
      } else if (item.type === 'pic') {
        innerContent += `\\pic{${item.data.url}}\n\n`;
      } else if (item.type === 'code') {
        innerContent += `\\begin{maccodebox}\n\\begin{LTR}\n\\begin{lstlisting}[language=${item.data.language || 'HTML'}]\n${item.data.code}\n\\end{lstlisting}\n\\end{LTR}\n\\end{maccodebox}\n\n`;
      }
    });
    return innerContent;
  };

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
      case 'pic':
        content += `\\pic{${block.data.url}}\n\n`;
        break;
      case 'code':
        content += `\\begin{maccodebox}\n\\begin{LTR}\n\\begin{lstlisting}[language=${block.data.language || 'HTML'}]\n${block.data.code}\n\\end{lstlisting}\n\\end{LTR}\n\\end{maccodebox}\n\n`;
        break;
      case 'notebox':
      case 'warnbox':
      case 'examplebox':
        let boxContent = block.data.items && block.data.items.length > 0 ? renderInnerBlocks(block.data.items) : (block.data.content ? `${block.data.content}\n\n` : '');
        let envName = block.type;
        content += `\\begin{${envName}}[${block.data.title}]\n${boxContent}\\end{${envName}}\n\n`;
        break;
      default:
        break;
    }
  });

  return content;
};
