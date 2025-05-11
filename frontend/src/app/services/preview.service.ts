import {Injectable} from '@angular/core';

@Injectable({ providedIn: 'root' })
export class PreviewService {
  generateTextPreview(content: string): string {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#04dd04';
    ctx.font = '10px Arial';
    const horizontalPadding = 40;
    const verticalPadding = 10;
    const maxWidth = canvas.width-(2*horizontalPadding);
    const lineHeight = 10;
    const maxLines = Math.floor((canvas.height-(2*verticalPadding))/lineHeight);
    let currentY = verticalPadding+5;
    let linesDrawn = 0;
    const strippedContent = this.stripHtmlTags(content);
    const paragraphs = strippedContent.split('\n');
    for (const paragraph of paragraphs) {
      if (linesDrawn >= maxLines) break;
      const words = paragraph.split(' ');
      let currentLine = '';
      for (const word of words) {
        if (linesDrawn >= maxLines) break;
        const testLine=currentLine ? `${currentLine} ${word}`:word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width <= maxWidth) {
          currentLine = testLine;
        } else {
          ctx.fillText(currentLine, horizontalPadding, currentY);
          currentY += lineHeight;
          linesDrawn++;
          currentLine = word;
          if (ctx.measureText(word).width > maxWidth) {
            this.wrapLongWord(ctx, word, maxWidth, horizontalPadding, currentY, lineHeight);
            currentY += lineHeight;
            linesDrawn++;
            currentLine = '';
          }
        }
      }
      if (currentLine && linesDrawn < maxLines) {
        ctx.fillText(currentLine, horizontalPadding, currentY);
        currentY += lineHeight;
        linesDrawn++;
      }
    }
    return canvas.toDataURL();
  }
  private wrapLongWord(ctx: CanvasRenderingContext2D, word: string, maxWidth: number, x: number, y: number, lineHeight: number){
    let remaining = word;
    while (remaining) {
      let i = 1;
      while (ctx.measureText(remaining.substring(0, i)).width<maxWidth && i<remaining.length) i++;
      ctx.fillText(remaining.substring(0, i), x, y);
      remaining = remaining.substring(i);
      y += lineHeight;
    }
  }
  private stripHtmlTags(html: string): string {
    if (!html) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    let text = tempDiv.textContent || tempDiv.innerText || '';
    text = text.replace(/\s+/g, ' ').trim();
    return text;
  }
}
