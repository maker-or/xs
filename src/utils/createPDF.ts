import jsPDF from 'jspdf';

// Interfaces for type safety
interface Message {
  role: string;
  content: string;
}

interface CodeBlock {
  index: number;
  lang: string;
  code: string;
}

interface MathExpression {
  index: number;
  math: string;
  isInline: boolean;
  position?: number; // Position within a text line for inline expressions
}

interface InlineCode {  // New inline code interface
  index: number;
  code: string;
}

interface FormattedContent {
  text: string;
  codeBlocks: CodeBlock[];
  mathExpressions: MathExpression[];
  tables: string[][][]; // Change from string[][] to string[][][] (array of tables)
  inlineCodes: InlineCode[]; // Added inline codes
}

interface TextSegment {
  text: string;
  styles: string[]; // e.g., ["bold", "italic"]
}

// Main function to create PDF from messages
export const createPDF = (messages: Message[]): void => {
  // Initialize the PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  const pageWidth: number = doc.internal.pageSize.getWidth();
  const pageHeight: number = doc.internal.pageSize.getHeight();
  const margin: number = 48;
  let y: number = margin + 8;
  const LINE_HEIGHT: number = 18; // Increased for better readability
  
  // Add logo and header styling based on Figma design
  doc.setFont("Helvetica", "italic");
  doc.setFontSize(18);
  doc.setTextColor(255, 98, 0); // Orange #FF6200

  doc.textWithLink("sphereai.in", 50, 60, { url: "https://sphereai.in" });
  
  // Add date on the right side
  const today = new Date();
  const formattedDate = `${today.toLocaleString('default', { month: 'long' })} ${today.getDate()}, ${today.getFullYear()}`;
  
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  const dateWidth = doc.getStringUnitWidth(formattedDate) * 12 / doc.internal.scaleFactor;
  doc.text(formattedDate, pageWidth - margin - dateWidth, 60);
  
  // Add separator line
  doc.setDrawColor(230, 230, 230);
  doc.setLineWidth(1);
  doc.line(margin, 80, pageWidth - margin, 80);
  y = 100; // Start content with better spacing

  // Helper function to format markdown content with improved parsing
  const formatMarkdownForPDF = (content: string): FormattedContent => {
    const codeBlocks: CodeBlock[] = [];
    let codeBlockIndex: number = 0;
    const mathExpressions: MathExpression[] = [];
    let mathIndex: number = 0;
    const tables: string[][][] = []; // Change from string[][] to string[][][]
    const inlineCodes: InlineCode[] = [];
    let inlineCodeIndex = 0;

    // Normalize line endings and add proper spacing
    let processedContent: string = content.replace(/\r\n/g, '\n');
    
    // First pass: Extract code blocks completely to avoid interference with other processing
    // Improved regex to better handle edge cases like nested backticks
    processedContent = processedContent.replace(
      /```([\w-]*)\n([\s\S]*?)```/g,
      (match, lang, code) => {
        // Preserve whitespace and line breaks in code
        codeBlocks.push({
          index: codeBlockIndex,
          lang: lang.trim() || "text",
          code: code.endsWith('\n') ? code : code + '\n' // Ensure code ends with newline
        });
        return `\n__CODE_BLOCK_${codeBlockIndex++}__\n`;
      }
    );

    // Add spacing for lists and headings after code blocks are extracted
    processedContent = processedContent
      .replace(/\n(#{1,6}\s)/g, "\n\n$1")
      .replace(/\n([*-]\s)/g, "\n\n$1")
      .replace(/\n(\d+\.\s)/g, "\n\n$1")
      .replace(/(\n\s*\n)/g, "$1\n")
      .replace(/\n{3,}/g, "\n\n");

    // Better handling for math expressions - preserve LaTeX syntax
    processedContent = processedContent
      // Process block math expressions ($$...$$)
      .replace(/\$\$([\s\S]*?)\$\$/g, (_, math: string) => {
        mathExpressions.push({ 
          index: mathIndex, 
          math: math.trim(), 
          isInline: false 
        });
        return `__MATH_BLOCK_${mathIndex++}__`;
      })
      // Normalize inline math delimiters \( ... \) → $ ... $
      .replace(/\\\(/g, "$").replace(/\\\)/g, "$")
      // Process inline math expressions ($...$) with careful handling
      .replace(/\$([^$\n]+?)\$/g, (match, math: string, offset: number) => {
        // Skip if the $ is preceded by a backslash (escaped)
        if (offset > 0 && processedContent[offset - 1] === '\\') {
          return match;
        }
        mathExpressions.push({ 
          index: mathIndex, 
          math: math.trim().replace(/\s+/g, ' '), 
          isInline: true,
          position: offset
        });
        return `__MATH_INLINE_${mathIndex++}__`;
      });

    // Process inline code (content within backticks) - more precise to avoid false positives
    processedContent = processedContent.replace(/`([^`\n]+?)`/g, (_, code: string) => {
      // Don't process backticks within code blocks (they should already be extracted)
      if (processedContent.includes('__CODE_BLOCK_')) {
        inlineCodes.push({ index: inlineCodeIndex, code });
        return `__INLINE_CODE_${inlineCodeIndex++}__`;
      }
      return _; // Return the original match if we're within a code block
    });

    // Handle LaTeX specific notations
    processedContent = processedContent
      // Handle LaTeX vector notation
      .replace(/\\vec\{([^}]*)\}/g, "→$1")
      // Handle summation notation \sum_{a}^{b}
      .replace(/\\sum_\{([^}]*)\}\^\{([^}]*)\}/g, "∑_($1)^($2)")
      // Handle fractions \frac{a}{b}
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "($1)/($2)")
      // Handle integrals \int_{a}^{b}
      .replace(/\\int_\{([^}]*)\}\^\{([^}]*)\}/g, "∫_($1)^($2)")
      // Handle general functions f(x), g(x), h(x)
      .replace(/([a-zA-Z])\s*\(\s*([a-zA-Z0-9+\-*/^_]+)\s*\)/g, "$1($2)")
      // Normalize Greek letters
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\delta/g, "δ")
      .replace(/\\theta/g, "θ")
      .replace(/\\lambda/g, "λ")
      .replace(/\\pi/g, "π")
      .replace(/\\sigma/g, "σ")
      .replace(/\\omega/g, "ω");

    // Process standard markdown syntax
    processedContent = processedContent
      .replace(/^### (.*$)/gm, '\n<<H1>>$1<<H1>>\n')
      .replace(/^#### (.*$)/gm, '\n<<H2>>$1<<H2>>\n')
      .replace(/^## (.*$)/gm, '\n<<H1>>$1<<H1>>\n')  // Added support for ## headings
      .replace(/^[*-] (.*$)/gm, '\n• $1')
      .replace(/^[*-] (.*$)/gm, '\n• $1')
      .replace(/^(\d+)\. (.*$)/gm, '\n$1. $2')
      .replace(/^> (.*$)/gm, '\n│ $1')
      .replace(/^---+$/gm, '\n─────────────────────\n')
      .trim();

    {
      // Enhanced table extraction - processes markdown tables properly
      // const tableRegex = /^\|(.+)\|$/gm;
      // let tableMatch;
      let tableBuffer: string[][] = [];
      let inTable = false;
      
      // Process content line by line to detect and extract tables
      const lines = processedContent.split('\n');
      const newContent: string[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Check if this line is part of a table
        if (line && line.trim().startsWith('|') && line.trim().endsWith('|')) {
          // Start collecting table rows
          if (!inTable) {
            inTable = true;
            tableBuffer = [];
          }
          
          // Skip separator rows (---|---) but keep track of them
          if (line && !/^\|\s*[-:]+[-| :]*\|$/.test(line)) {
            // Extract cells from the row
            const cells = line.trim()
              .slice(1, -1)  // Remove leading/trailing |
              .split('|')
              .map(cell => cell.trim());
            
            tableBuffer.push(cells);
          }
        } 
        // If we were in a table but this line is not a table row, table has ended
        else if (inTable) {
          inTable = false;
          if (tableBuffer.length > 0) {
            tables.push(tableBuffer);
            newContent.push(`__TABLE_BLOCK_${tables.length - 1}__`);
            tableBuffer = [];
          }
          newContent.push(line || '');
        }
        // Regular line, not a table
        else {
          newContent.push(line || '');
        }
      }
      
      // Handle case where table is at the end of the content
      if (inTable && tableBuffer.length > 0) {
        tables.push(tableBuffer);
        newContent.push(`__TABLE_BLOCK_${tables.length - 1}__`);
      }
      
      // Update processed content with table placeholders
      processedContent = newContent.join('\n');
    }

    return { text: processedContent, codeBlocks, mathExpressions, tables, inlineCodes };
  };

  // Helper function to parse inline styles with improved handling
  const parseInlineStyles = (text: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    let currentText = '';
    let i = 0;
    let boldActive = false;
    let italicActive = false;
    let strikeActive = false;
  
    while (i < text.length) {
      // Handle bold with ** or __
      if ((i + 1 < text.length) && 
          ((text[i] === '*' && text[i+1] === '*') || 
           (text[i] === '_' && text[i+1] === '_'))) {
        
        // Push current text segment before style change
        if (currentText) {
          segments.push({ 
            text: currentText, 
            styles: [
              ...(boldActive ? ['bold'] : []),
              ...(italicActive ? ['italic'] : []),
              ...(strikeActive ? ['strike'] : [])
            ] 
          });
          currentText = '';
        }
        
        boldActive = !boldActive;
        i += 2;
      }
      // Handle italic with * or _
      else if ((text[i] === '*' || text[i] === '_') && 
               (i === 0 || text[i-1] !== '\\') &&  // Not escaped
               !(i + 1 < text.length && text[i+1] === text[i])) {  // Not part of bold
        
        if (currentText) {
          segments.push({ 
            text: currentText, 
            styles: [
              ...(boldActive ? ['bold'] : []),
              ...(italicActive ? ['italic'] : []),
              ...(strikeActive ? ['strike'] : [])
            ] 
          });
          currentText = '';
        }
        
        italicActive = !italicActive;
        i++;
      }
      // Handle strikethrough with ~~ (GitHub flavored markdown)
      else if (i + 1 < text.length && text[i] === '~' && text[i+1] === '~') {
        if (currentText) {
          segments.push({ 
            text: currentText, 
            styles: [
              ...(boldActive ? ['bold'] : []),
              ...(italicActive ? ['italic'] : []),
              ...(strikeActive ? ['strike'] : [])
            ] 
          });
          currentText = '';
        }
        
        strikeActive = !strikeActive;
        i += 2;
      }
      else {
        currentText += text[i];
        i++;
      }
    }
    
    // Add the last segment
    if (currentText) {
      segments.push({ 
        text: currentText, 
        styles: [
          ...(boldActive ? ['bold'] : []),
          ...(italicActive ? ['italic'] : []),
          ...(strikeActive ? ['strike'] : [])
        ] 
      });
    }
    
    return segments;
  };

  // Helper function to render a line with styled segments
  const renderLine = (
    doc: jsPDF,
    segments: TextSegment[],
    startX: number,
    startY: number,
    maxWidth: number
  ): number => {
    let x: number = startX;
    let y: number = startY;

    for (const segment of segments) {
      const fontStyle: string = segment.styles.includes('italic') ? 'italic' : 'normal';
      // const fontWeight: string = segment.styles.includes('bold') ? 'bold' : 'normal';
      doc.setFont("Helvetica", fontStyle);
      doc.setFontSize(12);
      const lines: string[] = doc.splitTextToSize(segment.text, maxWidth - (x - startX));
      for (const line of lines) {
        const lineWidth: number = doc.getStringUnitWidth(line) * 12 / doc.internal.scaleFactor;
        if (x + lineWidth > startX + maxWidth) {
          y += LINE_HEIGHT;
          x = startX;
        }
        if (y > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(line, x, y);
        if (segment.styles.includes('strike')) {
          doc.line(x, y - 2, x + lineWidth, y - 2);
        }
        x += lineWidth;
      }
    }
    return y + LINE_HEIGHT;
  };

  // Modified renderCodeBlock for dynamic height calculation based on the number of lines
  const renderCodeBlock = (
    doc: jsPDF,
    code: string,
    lang: string,
    startX: number,
    startY: number,
    maxWidth: number
  ): number => {
    doc.setFont("Courier", "normal");
    doc.setFontSize(11);
    
    const codeLines = code.split('\n');
    const lines: string[] = [];
    for (const line of codeLines) {
      if (doc.getStringUnitWidth(line) * 11 / doc.internal.scaleFactor <= maxWidth - 30) {
        lines.push(line);
      } else {
        const indentMatch = line.match(/^(\s+)/);
        const indent = indentMatch ? indentMatch[1] : '';
        const wrappedLines = doc.splitTextToSize(line, maxWidth - 30);
        lines.push(wrappedLines[0]);
        for (let i = 1; i < wrappedLines.length; i++) {
          lines.push(indent + '  ' + wrappedLines[i]);
        }
      }
    }
    
    let y: number = startY + 10;
    // Dynamically calculate code block height with increased padding for better UX
    const totalLinesHeight = lines.length * LINE_HEIGHT;
    const paddingHeight = 40; // increased padding
    const dynamicHeight = totalLinesHeight + paddingHeight;
    
    // Improved background: darker fill with rounded corners and subtle border
    doc.setFillColor(40, 44, 52);
    doc.roundedRect(startX - 14, y - 14, maxWidth + 28, dynamicHeight, 10, 10, "F");
    doc.setDrawColor(60, 65, 71);
    doc.setLineWidth(0.8);
    doc.roundedRect(startX - 14, y - 14, maxWidth + 28, dynamicHeight, 10, 10);

    // Save drawing state
    doc.saveGraphicsState();
    
    // Improved language indicator styling
    if (lang && lang !== "text") {
      doc.setFillColor(30, 34, 40);
      doc.roundedRect(startX + 6, y - 12, 80, 28, 6, 6, "F");
      doc.setFont("Courier", "bold");
      doc.setFontSize(9);
      doc.setTextColor(140, 190, 255);
      doc.text(lang.toUpperCase(), startX + 14, y + 8);
      y += 30;
    } else {
      y += 24;
    }

    // Code content - ensure this is drawn AFTER the background
    doc.setFont("Courier", "normal");
    doc.setFontSize(12);
    doc.setTextColor(230, 230, 230);

    // Track line numbers for large code blocks
    let lineNumber = 1;
    let lineNumberWidth = 0;
    
    // Add line numbers for code blocks with many lines - more visible now
    const showLineNumbers = lines.length > 3; // Show line numbers for blocks with more than 3 lines
    if (showLineNumbers) {
      lineNumberWidth = 25; // Slightly wider for better readability
    }

    for (let i = 0; i < lines.length; i++) {
      // Check if we need a new page
      if (y > pageHeight - margin) {
        // Complete current page's code block
        
        // Add new page
        doc.addPage();
        y = margin + 22;
        // const currentPageStart = y;
        
        // Draw new code block background on new page
        const remainingHeight = Math.min(
          (lines.length - i) * LINE_HEIGHT + 40, 
          pageHeight - y - margin
        );
        
        doc.setFillColor(41, 43, 51);
        doc.roundedRect(startX - 16, y - 12, maxWidth + 24, remainingHeight, 8, 8, "F");
        
        // Reset text properties after page break
        doc.setFont("Courier", "normal");
        doc.setFontSize(11);
        doc.setTextColor(230, 230, 230);
        
        // Add continuation indicator
        doc.setFillColor(32, 36, 44);
        doc.roundedRect(startX, y - 5, 128, 22, 4, 4, "F");
        doc.setFont("Courier", "bold");
        doc.setFontSize(8);
        doc.setTextColor(130, 170, 255);
        doc.text("CODE CONTINUED", startX + 10, y + 10);
        y += 28;
      }

      // Add line numbers if needed - improved visibility
      if (showLineNumbers) {
        // Add light background for line number column
        doc.setFillColor(41, 43, 51);
        doc.rect(startX - 6, y - LINE_HEIGHT/2, lineNumberWidth + 5, LINE_HEIGHT, "F");
        
        // Render line number with better styling
        doc.setTextColor(150, 150, 160); // Brighter color for better readability
        doc.setFontSize(8);
        doc.text(lineNumber.toString().padStart(2, ' '), startX, y);
        doc.setTextColor(230, 230, 230);
        doc.setFontSize(11);
        lineNumber++;
      }

      // Apply basic syntax highlighting based on content
      const line = lines[i] || "";
      
      // Keywords for common programming languages
      const keywords = /(class|function|const|let|var|if|else|for|while|return|import|from|export|default|interface|type|extends|implements|public|private|protected)\b/g;
      const strings = /"([^"\\]*(\\.[^"\\]*)*)"|\\'([^'\\]*(\\.[^'\\]*)*)'|`([^`\\]*(\\.[^`\\]*)*)`/g;
      const comments = /\/\/(.*?)$|\/\*[\s\S]*?\*\//g;
      
      // Check if line contains patterns needing highlighting
      if (keywords.test(line) || strings.test(line) || comments.test(line)) {
        // Reset regexes since test() moves the index
        keywords.lastIndex = 0;
        strings.lastIndex = 0;
        comments.lastIndex = 0;
        
        // Split the line into segments for highlighting
        let lastIndex = 0;
        const segments: {text: string, color: number[]}[] = [];
        
        // Find keywords
        let keywordMatch;
        while ((keywordMatch = keywords.exec(line)) !== null) {
          if (keywordMatch.index > lastIndex) {
            segments.push({
              text: line.substring(lastIndex, keywordMatch.index),
              color: [230, 230, 230]
            });
          }
          segments.push({
            text: keywordMatch[0],
            color: [255, 150, 50] // Orange for keywords
          });
          lastIndex = keywordMatch.index + keywordMatch[0].length;
        }
        
        // Add remaining text
        if (lastIndex < line.length) {
          segments.push({
            text: line.substring(lastIndex),
            color: [230, 230, 230]
          });
        }
        
        // If we found segments to highlight
        if (segments.length > 0) {
          let xPos = startX + 15 + (showLineNumbers ? lineNumberWidth : 0);
          for (const segment of segments) {
            doc.setTextColor(
              segment.color[0] ?? 230, 
              segment.color[1] ?? 230, 
              segment.color[2] ?? 230
            );
            doc.text(segment.text, xPos, y);
            xPos += doc.getStringUnitWidth(segment.text) * 11 / doc.internal.scaleFactor;
          }
          // Reset text color after highlighting
          doc.setTextColor(230, 230, 230);
        } else {
          // If no highlighting, render line normally
          doc.text(line, startX + 15 + (showLineNumbers ? lineNumberWidth : 0), y);
        }
      } else {
        // Normal line without highlighting
        doc.text(line, startX + 15 + (showLineNumbers ? lineNumberWidth : 0), y);
      }
      
      y += LINE_HEIGHT;
    }

    // Restore drawing state
    doc.restoreGraphicsState();
    
    return y + 15;
  };

  // Helper function to render a math block with better formatting
  const renderMathBlock = (
    doc: jsPDF,
    math: string,
    startX: number,
    startY: number,
    maxWidth: number
  ): number => {
    const lines: string[] = doc.splitTextToSize(math, maxWidth - 40); // More padding
    let y: number = startY + 10; // Add spacing before math blocks
  
    // Visually distinctive math block with improved styling
    doc.setFillColor(248, 250, 252); // Lighter background for math
    doc.roundedRect(startX - 8, y - 8, maxWidth + 16, lines.length * LINE_HEIGHT + 26, 6, 6, "F");
    
    // Add math symbol indicator with better styling
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(12);
    doc.setTextColor(80, 80, 90); // Darker for better contrast
    doc.text("ƒ(x)", startX + 8, y + 10);
    doc.setDrawColor(180, 180, 190); // Slightly darker line
    doc.setLineWidth(0.5);
    doc.line(startX + 28, y + 6, startX + maxWidth - 18, y + 6);
    
    y += 15; // Increased spacing
  
    doc.setFont("Times", "italic");
    doc.setFontSize(13); // Larger font for math expressions
    doc.setTextColor(20, 20, 20);
    
    for (const line of lines) {
      if (y > pageHeight - margin) {
        doc.addPage();
        y = margin + 20; // Better spacing on new page
      }
      // Center math content
      const lineWidth = doc.getStringUnitWidth(line) * 13 / doc.internal.scaleFactor;
      doc.text(line, startX + (maxWidth - lineWidth) / 2, y);
      y += LINE_HEIGHT;
    }
    return y + 15; // Extra spacing after math blocks
  };

  // Updated renderTable function to mimic the style from image.png
const renderTable = (
  doc: jsPDF,
  tableData: string[][],
  startX: number,
  startY: number,
  maxWidth: number
): number => {
  if (!tableData || tableData.length === 0) return startY;
  
  // Calculate column widths based on content
  const colCount = Math.max(...tableData.map(row => row.length));
  let colWidths = new Array(colCount).fill(0);
  for (const row of tableData) {
    for (let c = 0; c < row.length; c++) {
      const cell = row[c] || "";
      const width = doc.getStringUnitWidth(cell) * 10 / doc.internal.scaleFactor;
      colWidths[c] = Math.max(colWidths[c], width);
    }
  }
  const totalWidth: number = colWidths.reduce((sum: number, w: number): number => sum + w, 0);
  const availWidth = maxWidth - 60; // extra padding
  if (totalWidth > availWidth) {
    const factor = availWidth / totalWidth;
    colWidths = colWidths.map(w => w * factor);
  }
  colWidths = colWidths.map(w => Math.max(w, 40));
  
  // Additional styling variables
  let y = startY + 20;
  const tableWidth: number = colWidths.reduce((sum: number, w: number): number => sum + w, 0) + (colCount * 8);
  
  // Outer container with custom background and shadow to mimic the image style
  doc.setFillColor(237, 244, 251); // light blue background
  doc.roundedRect(startX - 15, y - 20, tableWidth + 30, (tableData.length * (LINE_HEIGHT + 10)) + 40, 10, 10, "F");
  doc.setDrawColor(200, 215, 230);
  doc.setLineWidth(0.7);
  doc.roundedRect(startX - 15, y - 20, tableWidth + 30, (tableData.length * (LINE_HEIGHT + 10)) + 40, 10, 10);
  
  // Header row with a deep blue background and white text
  if (tableData[0]) {
    doc.setFillColor(0, 82, 155);  // deep blue
    doc.roundedRect(startX - 6, y - 10, tableWidth + 12, LINE_HEIGHT + 20, 4, 4, "F");
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    let colX = startX;
    for (let c = 0; c < tableData[0].length; c++) {
      const text = tableData[0][c] || "";
      const cellLines = doc.splitTextToSize(text, colWidths[c] - 14);
      doc.text(cellLines, colX + 10, y + 6);
      colX += colWidths[c] + 8;
    }
    y += LINE_HEIGHT + 20;
  }
  
  // Data rows with alternating white and very light gray backgrounds
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  for (let r = 1; r < tableData.length; r++) {
    const row = tableData[r];
    if (!row) continue;
    if (r % 2 === 0) {
      doc.setFillColor(248, 248, 248); 
      doc.roundedRect(startX - 6, y - 8, tableWidth + 12, LINE_HEIGHT + 16, 4, 4, "F");
    } else {
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(startX - 6, y - 8, tableWidth + 12, LINE_HEIGHT + 16, 4, 4, "F");
    }
    
    // Handle page overflow with header repetition
    if (y > pageHeight - margin - 40) {
      doc.addPage();
      y = margin + 25;
      doc.setFillColor(0, 82, 155);
      doc.roundedRect(startX - 6, y - 10, tableWidth + 12, LINE_HEIGHT + 20, 4, 4, "F");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("Table continued...", startX + 10, y + 6);
      y += LINE_HEIGHT + 20;
    }
    
    doc.setTextColor(60, 60, 70);
    let colX = startX;
    let maxCellHeight = LINE_HEIGHT;
    for (let c = 0; c < row.length; c++) {
      const cell = row[c] || "";
      const colWidth = colWidths[c];
      // Align numbers to right
      const isNumeric = !isNaN(Number(cell.replace(/[,$%]/g, '')));
      const _align = isNumeric ? 'right' : 'left';
      const _xOffset = isNumeric ? colWidth - 4 : 10;
      const cellLines = doc.splitTextToSize(cell, colWidth - 14);
      maxCellHeight = Math.max(maxCellHeight, cellLines.length * LINE_HEIGHT);
    }
    for (let c = 0; c < row.length; c++) {
      const cell = row[c] || "";
      const colWidth = colWidths[c];
      // Align numbers to right
      const isNumeric = !isNaN(Number(cell.replace(/[,$%]/g, '')));
      const align = isNumeric ? 'right' : 'left';
      const xOffset = isNumeric ? colWidth - 4 : 10;
      const cellLines = doc.splitTextToSize(cell, colWidth - 14);
      doc.text(cellLines, colX + xOffset, y + 6, { align });
      colX += colWidth + 8;
    }
    y += maxCellHeight + 10;
  }
  
  // Bottom border
  doc.setDrawColor(210, 220, 230);
  doc.setLineWidth(0.7);
  doc.line(startX - 8, y - 2, startX + tableWidth + 8, y - 2);
  
  return y + 20;
};

  // Improved rendering for inline math
  const renderInlineMath = (
    doc: jsPDF,
    text: string,
    mathExpressions: MathExpression[],
    x: number,
    y: number,
    maxWidth: number
  ): number => {
    let currentX = x;
    let currentY = y;
    let remainingText = text;
    
    // Find all inline math placeholders
    const mathPlaceholders = text.match(/__MATH_INLINE_\d+__/g) || [];
    
    if (mathPlaceholders.length === 0) {
      // If no math expressions, render the text normally
      const segments: TextSegment[] = parseInlineStyles(text);
      return renderLine(doc, segments, x, y, maxWidth);
    }
    
    // Process text with inline math
    for (const placeholder of mathPlaceholders) {
      const parts = remainingText.split(placeholder, 2);
      if (parts.length < 2) continue;
      
      // Render text before the math
      if (parts[0]) {
        const segments: TextSegment[] = parseInlineStyles(parts[0]);
        const textWidth = doc.getStringUnitWidth(parts[0]) * 11 / doc.internal.scaleFactor;
        if (currentX + textWidth > x + maxWidth) {
          currentY += LINE_HEIGHT;
          currentX = x;
        }
        renderLine(doc, segments, currentX, currentY, maxWidth - (currentX - x));
        currentX += textWidth;
      }
      
      // Get math expression
      const mathIndexMatch = placeholder.match(/__MATH_INLINE_(\d+)__/);
      if (mathIndexMatch && mathIndexMatch[1]) {
        const mathIndex = parseInt(mathIndexMatch[1]);
        const mathExpr = mathExpressions[mathIndex];
        if (mathExpr) {
          const { math } = mathExpr;
          
          // Switch to math style with better visibility
          doc.setFont("Helvetica", "italic");
          doc.setFontSize(12);
          doc.setTextColor(10, 10, 60); // Darker color for math
          
          // Add special formatting with improved visual distinction
          const mathText = `\u2329${math}\u232A`; // Using proper angle brackets
          // Add subtle background for inline math
          const mathWidth = doc.getStringUnitWidth(mathText) * 12 / doc.internal.scaleFactor;
          
          if (currentX + mathWidth > x + maxWidth) {
            currentY += LINE_HEIGHT;
            currentX = x;
          }
          
          // Add subtle highlight behind inline math
          doc.setFillColor(245, 245, 250);
          doc.roundedRect(currentX - 2, currentY - 12, mathWidth + 4, 16, 3, 3, "F");
          
          doc.text(mathText, currentX, currentY);
          currentX += mathWidth;
        }
      }
      
      remainingText = parts[1] || '';
    }
    
    // Render any remaining text after the last math expression
    if (remainingText) {
      const segments: TextSegment[] = parseInlineStyles(remainingText);
      const textWidth = doc.getStringUnitWidth(remainingText) * 11 / doc.internal.scaleFactor;
      
      if (currentX + textWidth > x + maxWidth) {
        currentY += LINE_HEIGHT;
        currentX = x;
      }
      
      renderLine(doc, segments, currentX, currentY, maxWidth - (currentX - x));
    }
    
    return currentY + LINE_HEIGHT;
  };
  console.log(renderInlineMath)

  // Improved rendering for inline code
  // const renderInlineCode = (
  //   doc: jsPDF,
  //   text: string,
  //   inlineCodes: { index: number; code: string }[],
  //   x: number,
  //   y: number,
  //   maxWidth: number
  // ): number => {
  //   let currentX = x;
  //   let currentY = y;
  //   let remainingText = text;
  //   const placeholders = text.match(/__INLINE_CODE_\d+__/g) || [];

  //   for (const placeholder of placeholders) {
  //     const parts = remainingText.split(placeholder, 2);
  //     if (parts[0]) {
  //       const segments: TextSegment[] = parseInlineStyles(parts[0]);
  //       currentY = renderLine(doc, segments, currentX, currentY, maxWidth - (currentX - x));
  //       currentX += doc.getStringUnitWidth(parts[0]) * 11 / doc.internal.scaleFactor;
  //     }
  //     const inlineMatch = placeholder.match(/__INLINE_CODE_(\d+)__/);
  //     if (inlineMatch) {
  //       const index = parseInt(inlineMatch[1]);
  //       const code = inlineCodes.find(c => c.index === index)?.code || "";
  //       doc.setFont("Courier", "normal");
  //       doc.setFontSize(10);
  //       // Render inline code with improved styling
  //       const codeWidth = doc.getStringUnitWidth(code) * 10 / doc.internal.scaleFactor;
  //       doc.setFillColor(235, 235, 240); // Subtle background for inline code
  //       doc.roundedRect(currentX - 2, currentY - 10, codeWidth + 6, 16, 3, 3, "F"); // Rounded corners
  //       doc.setTextColor(60, 60, 80); // Darker text for better readability
  //       doc.text(code, currentX + 1, currentY); // Slight padding
  //       currentX += codeWidth + 2; // Added spacing after inline code
  //     }
  //     remainingText = parts[1];
  //   }
  //   if (remainingText) {
  //     const segments: TextSegment[] = parseInlineStyles(remainingText);
  //     currentY = renderLine(doc, segments, currentX, currentY, maxWidth - (currentX - x));
  //   }
  //   return currentY;
  // };

  // Helper function to render styled markdown elements
  const renderStyledText = (
    doc: jsPDF,
    line: string,
    x: number,
    y: number,
    maxWidth: number,
    mathExpressions: MathExpression[],
    tables: string[][][],
    inlineCodes: { index: number; code: string }[]
  ): number => {
    // Handle headings with improved formatting and spacing
    console.log(tables)
    console.log(inlineCodes)
    if (line.match(/^<<H1>>(.*)<<H1>>$/)) {
      const text: string = line.replace(/^<<H1>>(.*)<<H1>>$/, "$1");
      // Add subtle underline for H1 headings
      // doc.setDrawColor(255, 98, 0); // Orange for heading underline
      // doc.setLineWidth(0.75);
      
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(40, 40, 40); // Dark gray for headings
      doc.text(text, x, y);
      
      // Add underline
      const textWidth = doc.getStringUnitWidth(text) * 18 / doc.internal.scaleFactor;
      doc.line(x, y + 5, x + textWidth, y + 5);
      
      return y + 28; // More space after headings
    } else if (line.match(/^<<H2>>(.*)<<H2>>$/)) {
      const text: string = line.replace(/^<<H2>>(.*)<<H2>>$/, "$1");
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(60, 60, 60);
      doc.text(text, x, y);
      return y + 24; // More space after sub-headings
    }
    // Enhanced bullet points with better indentation and spacing
    else if (line.startsWith('• ')) {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(20, 20, 20);
      
      // Better bullet styling
      doc.setFillColor(255, 98, 0);
      doc.circle(x + 3, y - 4, 2, 'F');
      
      const segments: TextSegment[] = parseInlineStyles(line.substring(2));
      return renderLine(doc, segments, x + 15, y, maxWidth - 15); // Better indentation
    }
    // Enhanced numbered lists with better alignment and spacing
    else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match && match[1] && match[2]) {
        const number: string = match[1];
        const content: string = match[2];
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(12);
        doc.setTextColor(20, 20, 20);
        
        // Better number styling
        doc.setTextColor(255, 98, 0); // Orange for numbers
        doc.text(number + '.', x, y);
        doc.setTextColor(20, 20, 20); // Back to normal text color
        
        const numberWidth: number = doc.getStringUnitWidth(number + '.') * 12 / doc.internal.scaleFactor;
        const segments: TextSegment[] = parseInlineStyles(content);
        return renderLine(doc, segments, x + numberWidth + 8, y, maxWidth - numberWidth - 8);
      }
      return y + LINE_HEIGHT; // Default return if match fails
    }
    // Enhanced blockquote styling
    else if (line.startsWith('│ ')) {
      // Light background with left accent border
      doc.setFillColor(246, 248, 252); // Lighter blue tint
      doc.roundedRect(x - 10, y - 12, maxWidth + 20, LINE_HEIGHT + 16, 4, 4, "F");
      
      // Vertical accent bar
      doc.setFillColor(255, 98, 0, 0.7); // Orange bar with transparency
      doc.rect(x - 8, y - 10, 3, LINE_HEIGHT + 12, "F");
      
      // Text with better styling
      doc.setFont("Helvetica", "italic");
      doc.setFontSize(12);
      doc.setTextColor(70, 70, 70);
      const segments: TextSegment[] = parseInlineStyles(line.substring(2));
      return renderLine(doc, segments, x + 10, y, maxWidth - 12) + 4; // Extra spacing after blockquotes
    }
    // Regular text with improved parsing
    else {
      doc.setTextColor(20, 20, 20);
      const segments: TextSegment[] = parseInlineStyles(line);
      return renderLine(doc, segments, x, y, maxWidth) + 2; // Slight extra spacing between paragraphs
    }
  };

  // Process each message with improved message styling
  messages.forEach((message: Message, index: number) => {
    if (y > pageHeight - 150) {
      doc.addPage();
      y = margin + 20;
    }
    console.log(index)
    // Display bold orange header for user messages
    if (message.role === "user") {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 98, 0);
      doc.text(message.content, margin, y + 5);
      y += 40; // Only header, skip further normal content rendering
    } else {
      // For non-user messages, render normal content
      doc.setFontSize(12);
      const { text, codeBlocks, mathExpressions, tables, inlineCodes }: FormattedContent = formatMarkdownForPDF(message.content);
      const parts: string[] = text.split(/\n/);
      
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(50, 50, 50);

      let prevWasSpecialBlock = false;
      for (const part of parts) {
        if ((part.includes('__CODE_BLOCK_') || part.includes('__MATH_BLOCK_') || 
             part.match(/^<<H1>>.*<<H1>>$/) || part.match(/^<<H2>>.*<<H2>>$/)) && 
            !prevWasSpecialBlock) {
          y += 4;
        }
        
        if (part.includes('__CODE_BLOCK_')) {
          const blockIndexMatch = part.match(/__CODE_BLOCK_(\d+)__/);
          if (blockIndexMatch && blockIndexMatch[1]) {
            const blockIndex = parseInt(blockIndexMatch[1]);
            if (blockIndex >= 0 && blockIndex < codeBlocks.length) {
              y += 8;
              const codeBlock = codeBlocks[blockIndex];
              // Add null check to avoid "Property does not exist on undefined" errors
              const code = codeBlock?.code || "";
              const lang = codeBlock?.lang || "";
              y = renderCodeBlock(doc, code, lang, margin, y, pageWidth - margin * 2);
              prevWasSpecialBlock = true;
            }
          }
        } else if (part.includes('__TABLE_BLOCK_')) {
          const tableIndexMatch = part.match(/__TABLE_BLOCK_(\d+)__/);
          if (tableIndexMatch && tableIndexMatch[1]) {
            const tableIndex = parseInt(tableIndexMatch[1]);
            if (tableIndex >= 0 && tableIndex < tables.length) {
              y += 8;
              // Provide default empty array if table is undefined
              const tableData = tables[tableIndex] || [];
              // Fix unsafe return by explicitly typing the return value
              const newY: number = renderTable(doc, tableData, margin, y, pageWidth - margin * 2);
              y = newY;
              prevWasSpecialBlock = true;
            }
          }
        } else if (part.includes('__MATH_BLOCK_')) {
          const mathIndexMatch = part.match(/__MATH_BLOCK_(\d+)__/);
          if (mathIndexMatch && mathIndexMatch[1]) {
            const mathIndex = parseInt(mathIndexMatch[1]);
            // Add null check and provide default value if math expression is undefined
            const mathExpression = mathExpressions[mathIndex];
            const mathContent = mathExpression?.math || "";
            // Fix unsafe return by explicitly typing the return value
            const newY: number = renderMathBlock(doc, mathContent, margin, y, pageWidth - margin * 2);
            y = newY;
            prevWasSpecialBlock = true;
          }
        } else if (part.includes('__INLINE_CODE_')) {
          if (part.trim().startsWith('__INLINE_CODE_') && part.trim().endsWith('__')) {
            const codeMatch = part.match(/__INLINE_CODE_(\d+)__/);
            if (codeMatch && codeMatch[1]) {
              const codeIndex = parseInt(codeMatch[1]);
              const inlineCode = inlineCodes.find(c => c.index === codeIndex);
              if (inlineCode) {
                // Provide default empty string if code is undefined
                const code = inlineCode.code || "";
                y = renderCodeBlock(doc, code, "", margin, y, pageWidth - margin * 2);
                prevWasSpecialBlock = true;
                continue;
              }
            }
          }
        } else if (part.trim() === '') {
          y += LINE_HEIGHT / 2;
          prevWasSpecialBlock = false;
        } else {
          // Ensure y is always a number
          const newY = renderStyledText(doc, part, margin, y, pageWidth - margin * 2, mathExpressions, tables, inlineCodes);
          y = typeof newY === 'number' ? newY : y; // Fallback to current y if returned value isn't a number
          prevWasSpecialBlock = false;
        }

        if (y > pageHeight - margin - 40) {
          doc.addPage();
          y = margin + 20;
        }
      }
    }
  });
  
  // Add enhanced footer with page numbers and branding
  const totalPages = doc.internal.pages.length-1;
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Add footer line
    doc.setDrawColor(240, 240, 240);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 40, pageWidth - margin, pageHeight - 40);
    
    // Page numbers
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 25, { align: 'center' });
    
    // Branding in footer
    doc.setFont("Helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(255, 98, 0);
    doc.text("Created with Sphereai.in", pageWidth - margin, pageHeight - 25, { align: 'right' });
  }

  // Save the PDF with improved filename
  const timestamp = new Date().toISOString().slice(0,10).replace(/-/g,'');
  doc.save(`sphereai-conversation-${timestamp}.pdf`);
};