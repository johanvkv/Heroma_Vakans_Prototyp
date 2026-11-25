// Capture a small crop around the place where the comment was made.
// The feedback controls themselves are excluded from the image.
export async function captureFeedbackScreenshot(clientX: number, clientY: number): Promise<string> {
  const { default: html2canvas } = await import('html2canvas');
  const viewport = await html2canvas(document.body, {
    backgroundColor: '#ffffff',
    width: window.innerWidth,
    height: window.innerHeight,
    x: window.scrollX,
    y: window.scrollY,
    scrollX: -window.scrollX,
    scrollY: -window.scrollY,
    windowWidth: window.innerWidth,
    windowHeight: window.innerHeight,
    scale: 1,
    logging: false,
    useCORS: true,
    ignoreElements: element => element.classList.contains('feedback-root'),
  });
  const image = document.createElement('canvas');
  image.width = 200;
  image.height = 200;
  const context = image.getContext('2d');
  if (!context) throw new Error('Kunde inte skapa en skärmbild.');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, 200, 200);
  // Keep the click at the centre, including when it is near a viewport edge.
  const left = Math.round(clientX - 100);
  const top = Math.round(clientY - 100);
  const sourceX = Math.max(0, left);
  const sourceY = Math.max(0, top);
  const width = Math.min(200 - Math.max(0, -left), viewport.width - sourceX);
  const height = Math.min(200 - Math.max(0, -top), viewport.height - sourceY);
  if (width > 0 && height > 0) context.drawImage(viewport, sourceX, sourceY, width, height,
    Math.max(0, -left), Math.max(0, -top), width, height);
  const dataUrl = image.toDataURL('image/webp', 0.72);
  if (!dataUrl.startsWith('data:image/webp;base64,') || dataUrl.length > 110_000) throw new Error('Skärmbilden blev för stor.');
  return dataUrl;
}
