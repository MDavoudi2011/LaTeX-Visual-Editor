export function htmlToLatex(html: string): string {
  if (!html) return '';
  let tex = html;
  
  // Clean up div and p tags representing new lines
  tex = tex.replace(/<div><br><\/div>/gi, '\n');
  tex = tex.replace(/<div>/gi, '\n');
  tex = tex.replace(/<\/div>/gi, '');
  tex = tex.replace(/<p><br><\/p>/gi, '\n\n');
  tex = tex.replace(/<p>/gi, '\n\n');
  tex = tex.replace(/<\/p>/gi, '');
  tex = tex.replace(/<br\s*\/?>/gi, '\n');

  // Replace Bolding
  tex = tex.replace(/<b>(.*?)<\/b>/gi, '\\textbf{$1}');
  tex = tex.replace(/<strong>(.*?)<\/strong>/gi, '\\textbf{$1}');
  tex = tex.replace(/\*\*(.*?)\*\*/g, '\\textbf{$1}');
  
  // Replace Italics
  tex = tex.replace(/<i>(.*?)<\/i>/gi, '\\textit{$1}');
  tex = tex.replace(/<em>(.*?)<\/em>/gi, '\\textit{$1}');

  // Replace Underline
  tex = tex.replace(/<u>(.*?)<\/u>/gi, '\\underline{$1}');

  // Replace Lists (though we handle this in the generator mostly now)
  tex = tex.replace(/<ul>([\s\S]*?)<\/ul>/gi, (match, inner) => {
    const items = inner.replace(/<li>(.*?)<\/li>/gi, '\\item $1\n');
    return `\\begin{itemize}\n${items}\\end{itemize}\n`;
  });

  // Strip remaining HTML tags
  tex = tex.replace(/<[^>]+>/g, '');

  // Unescape HTML entities
  tex = tex.replace(/&nbsp;/g, ' ');
  tex = tex.replace(/&lt;/g, '<');
  tex = tex.replace(/&gt;/g, '>');
  tex = tex.replace(/&amp;/g, '&');

  return tex.trim();
}
