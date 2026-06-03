export function htmlToLatex(html: string): string {
  if (!html) return '';
  
  let tex = html;
  
  // Unescape HTML entities first so they don't break our English text regex
  tex = tex.replace(/&nbsp;/g, ' ');
  tex = tex.replace(/&lt;/g, '<');
  tex = tex.replace(/&gt;/g, '>');
  tex = tex.replace(/&amp;/g, '&');

  // Wrap English text in \lr{} - skipping HTML tags
  tex = tex.replace(/(<[^>]+>)|([A-Za-z0-9\s.,;:!?'"()\[\]{}\-+=*/%&$#@]+)/g, (match, tag, text) => {
    if (tag) return match;
    if (text && /[A-Za-z]/.test(text)) {
      const spaceMatch = text.match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (spaceMatch) {
         return `${spaceMatch[1]}\\lr{${spaceMatch[2]}}${spaceMatch[3]}`;
      }
    }
    return match;
  });

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

  return tex.trim();
}
