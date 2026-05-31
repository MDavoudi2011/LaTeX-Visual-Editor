export const LATEX_PREAMBLE = `%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% به هیچ وجه محتوای قبل
% begin{document} 
% رو تغییر ندید
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

\\documentclass[12pt,a4paper]{article}

\\usepackage[a4paper, left=2cm, right=2cm, bottom=3cm, top=3cm]{geometry}
\\usepackage{amsmath}
\\usepackage[svgnames]{xcolor}
\\usepackage[many]{tcolorbox}
\\usepackage{fontawesome5}
\\usepackage{titlesec}
\\usepackage{graphicx}
\\usepackage{tikz}
\\usetikzlibrary{calc}
\\usepackage{eso-pic}
\\usepackage{setspace}

\\definecolor{mainColor}{HTML}{2B547E}    
\\definecolor{accentColor}{HTML}{E74C3C}  
\\definecolor{noteBg}{HTML}{E8F4F8}       
\\definecolor{warnBg}{HTML}{FDF2E9}       
\\definecolor{exampleFrame}{HTML}{27AE60} 
\\definecolor{exampleBg}{HTML}{EAFBF1}

\\AddToShipoutPictureBG{%
	\\begin{tikzpicture}[remember picture, overlay]
		\\draw[mainColor!80!black, line width=3pt, rounded corners=20pt]
		([xshift=1.2cm,yshift=-1.2cm]current page.north west)
		rectangle
		([xshift=-1.2cm,yshift=1.2cm]current page.south east);
		
		\\node[opacity=1] at (current page.center) {\\includegraphics[width=18cm]{watermark.jpg}};
	\\end{tikzpicture}
}

\\titleformat{\\section}
{\\color{mainColor}\\normalfont\\Large\\bfseries}
{\\color{mainColor}\\thesection}{1em}{}[{\\color{mainColor}\\titlerule[1pt]}]

\\titleformat{\\subsection}
{\\color{mainColor!80!black}\\normalfont\\large\\bfseries}
{\\color{mainColor!80!black}\\thesubsection}{1em}{}

\\newtcolorbox{notebox}[1][نکته]{
	enhanced, colback=noteBg, colframe=mainColor, coltitle=white,
	fonttitle=\\bfseries, title={\\faInfoCircle\\quad #1},
	boxrule=1.2pt, arc=5pt, drop shadow,
	left=10pt, right=10pt, top=10pt, bottom=10pt,
	before skip=10pt, after skip=10pt
}

\\newtcolorbox{warnbox}[1][مهم]{
	enhanced, colback=warnBg, colframe=accentColor, coltitle=white,
	fonttitle=\\bfseries, title={\\faExclamationTriangle\\quad #1},
	boxrule=1.2pt, arc=5pt, drop shadow,
	left=10pt, right=10pt, top=10pt, bottom=10pt,
	before skip=10pt, after skip=10pt
}

\\newtcolorbox{examplebox}[1][مثال]{
	enhanced, colback=exampleBg, colframe=exampleFrame, coltitle=white,
	fonttitle=\\bfseries, title={\\faLightbulb\\quad #1},
	boxrule=1.5pt, arc=8pt, drop shadow,
	left=15pt, right=15pt, top=15pt, bottom=15pt,
	before skip=15pt, after skip=15pt
}

% --- Added for Visual Editor Mac-style Code Box ---
\\usepackage{listings}
\\definecolor{codeBG}{HTML}{1E1E1E}
\\definecolor{macRed}{HTML}{FF5F56}
\\definecolor{macYellow}{HTML}{FFBD2E}
\\definecolor{macGreen}{HTML}{27C93F}

\\newtcolorbox{maccodebox}[1][]{
    enhanced,
    colback=codeBG,
    colframe=codeBG,
    arc=8pt,
    boxrule=0pt,
    top=20pt,bottom=5pt,left=5pt,right=5pt,
    overlay={
        \\fill[macRed] ([xshift=15pt,yshift=-12pt]frame.north west) circle (4pt);
        \\fill[macYellow] ([xshift=27pt,yshift=-12pt]frame.north west) circle (4pt);
        \\fill[macGreen] ([xshift=39pt,yshift=-12pt]frame.north west) circle (4pt);
    },
    #1
}

\\lstset{
    backgroundcolor=\\color{codeBG},
    basicstyle=\\color{white}\\ttfamily\\footnotesize,
    numbers=left,
    numberstyle=\\color{gray}\\ttfamily\\footnotesize,
    stepnumber=1,
    numbersep=10pt,
    xleftmargin=20pt,
    showspaces=false,
    showstringspaces=false,
    showtabs=false,
    frame=none,
    rulecolor=\\color{black},
    tabsize=2,
    breaklines=true,
    breakatwhitespace=true,
    keywordstyle=\\color{blue!40!white},
    commentstyle=\\color{green!40!white},
    stringstyle=\\color{red!40!white},
}

\\lstdefinelanguage{css}{
  keywords={color,background-image:,margin,padding,font,weight,display,position,top,left,right,bottom,list,style,border,size,white,space,min,width, transition:, transform:, transition-property, transition-duration, transition-timing-function},	
  sensitive=true,
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]',
  morestring=[b]",
  alsoletter={:}
}
\\lstdefinelanguage{javascript}{
  morekeywords={typeof, new, true, false, catch, function, return, null, catch, switch, var, if, in, while, do, else, case, break},
  morecomment=[s]{/*}{*/},
  morecomment=[l]//,
  morestring=[b]",
  morestring=[b]'
}
\\lstalias{typescript}{javascript}
\\lstalias{html}{HTML}

% --------------------------------------------------

\\usepackage[hidelinks]{hyperref}
\\usepackage{xepersian}
\\settextfont[
  Path=./,
  Extension=.ttf,
  BoldFont=Vazirmatn-Bold,
  Scale=1.1,
  AutoFakeSlant
]{Vazirmatn-Regular}

\\setdigitfont[
  Path=./,
  Extension=.ttf,
  BoldFont=Vazirmatn-Bold
]{Vazirmatn-Regular}

\\newcommand{\\addwatermark}{
\\AddToShipoutPictureBG*{%
		\\begin{tikzpicture}[remember picture, overlay]
			\\node[anchor=north east, xshift=-1cm, yshift=0cm] at (current page.north east) {
				\\includegraphics[width=3cm]{logo.png}
			};
		\\end{tikzpicture}
	}
}

\\newcommand{\\header}[3]{
	\\begin{center}
		{\\Huge \\textbf{\\textcolor{mainColor}{#1}} \\par}
		
		\\vspace{0.8cm}
		
		{\\Large \\textbf{\\textcolor{mainColor!80!black}{#2}} \\par}		

        {\\Large \\textbf{\\textcolor{mainColor!80!black}{تهیه شده توسط گروه برنامه نویسی هوشیار}} \\par}
        
    	\\vspace{0.5cm}
    	
    	{\\large مدرس دوره: #3 \\quad $\\vert$ \\quad منتور: مهندس مینا طرهانی \\par}
        
	\\end{center}
	
	\\vspace{0.5cm}
}

\\newcommand{\\pic}[1]{
\\vspace{0.5cm}
	\\begin{center}
		\\tcbox
		[enhanced, boxsep=0pt, top=0pt, bottom=0pt, left=0pt, right=0pt,
		boxrule=0pt, arc=12pt, auto outer arc, clip upper, drop shadow]
		{\\includegraphics[width=1\\linewidth]{#1}}
	\\end{center}
\\vspace{0.3cm}
}
	
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
% به هیچ وجه محتوای قبل
% begin{document} 
% رو تغییر ندید
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%`;
