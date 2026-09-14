import { DroppedComponent } from './pageBuilderTypes';

// ── Design tokens ──────────────────────────────────────────────────────────────
const T = {
  primary:   '#5236ab',
  secondary: '#f6f8f9',
  fg:        '#333333',
  fgMuted:   '#666666',
  bg:        '#ffffff',
  border:    '#efefef',
  error:     '#e31937',
  warning:   '#f59e0b',
  success:   '#0e9f6e',
  info:      '#1a56db',
  font:      'Source Sans Pro, Lato, sans-serif',
};

// ── Geometry ───────────────────────────────────────────────────────────────────
const FRAME_WIDTH  = 1200;
const FRAME_GAP    = 40;   // vertical gap between top-level frames
const FRAME_PAD    = 20;   // internal padding
const FRAME_PAD_V  = 16;
const ROW_GAP      = 12;

// ── Low-level SVG helpers ──────────────────────────────────────────────────────
const rect  = (x: number, y: number, w: number, h: number, fill: string, opts: string = '') =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${opts} />`;

const text  = (x: number, y: number, content: string, size: number, weight: string, fill: string, anchor = 'start', opts = '') =>
  `<text x="${x}" y="${y}" font-family="${T.font}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${opts}>${esc(content)}</text>`;

const line  = (x1: number, y1: number, x2: number, y2: number, stroke: string, sw = 1) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" />`;

const esc = (s: string) => String(s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

// ── Measurement helpers ────────────────────────────────────────────────────────
// Approximate text width (proportional font metrics)
const approxTextW = (s: string, size: number, weight: string) => {
  const base = weight === '700' || weight === 'bold' || weight === '600' ? 0.62 : 0.55;
  return Math.ceil(s.length * size * base);
};

// ── Component renderers ────────────────────────────────────────────────────────
// Each renderer returns { svg: string, height: number }

interface Rendered { svg: string; height: number; }

const renderButton = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const label = c.buttonText || 'Button';
  const h = 34;
  let bg = T.primary; let fg = '#fff'; let stroke = '';
  if (c.type === 'secondary-button') { bg = '#fff'; fg = T.primary; stroke = ` stroke="${T.primary}" stroke-width="1"`; }
  if (c.type === 'tertiary-button')  { bg = 'transparent'; fg = T.primary; }
  const bw = Math.min(Math.max(approxTextW(label, 16, '600') + 32, 80), w);
  let svg = rect(x, y, bw, h, bg, stroke + ' rx="0"');
  svg += text(x + bw / 2, y + h / 2 + 6, label, 16, '600', fg, 'middle');
  return { svg, height: h };
};

const renderSegmented = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const opts = ['Walk', 'Train', 'Car'];
  const bw = Math.min(Math.floor(w / opts.length), 120);
  const h = 34;
  let svg = '';
  opts.forEach((opt, i) => {
    const bx = x + i * bw;
    const bg = i === 0 ? '#e6e3f3' : '#fff';
    svg += rect(bx, y, bw, h, bg, ` stroke="#333" stroke-width="1"`);
    svg += text(bx + bw / 2, y + h / 2 + 6, opt, 14, '600', T.fg, 'middle');
  });
  return { svg, height: h };
};

const renderText = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const content = c.textContent || '';
  if (c.type === 'text-list') {
    const items = content.split('\n').filter(l => l.trim());
    let svg = '';
    items.forEach((item, i) => {
      svg += text(x + 12, y + i * 20 + 14, `• ${item}`, 15, '400', T.fg);
    });
    return { svg, height: Math.max(items.length * 20, 20) };
  }
  if (c.type === 'text-link') {
    return { svg: text(x, y + 16, content, 15, '400', T.primary) + `<line x1="${x}" y1="${y + 18}" x2="${x + approxTextW(content, 15, '400')}" y2="${y + 18}" stroke="${T.primary}" stroke-width="1" />`, height: 22 };
  }
  const size = c.type === 'text-heading' ? 22 : c.type === 'text-subheading' ? 18 : 15;
  const weight = c.type === 'text-heading' ? '700' : c.type === 'text-subheading' ? '600' : '400';
  return { svg: text(x, y + size, content, size, weight, T.fg), height: size + 6 };
};

const renderAlert = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const variant = c.alertVariant || (c.type.includes('alert-') ? c.type.replace('alert-', '') : 'info') as string;
  const msg = c.alertMessage || `This is a ${variant} alert`;
  const colors: Record<string, { bg: string; bar: string; fg: string }> = {
    info:    { bg: '#e8f0fd', bar: T.info,    fg: '#1e3a5f' },
    success: { bg: '#e3f8ee', bar: T.success,  fg: '#1a4731' },
    warning: { bg: '#fef3c7', bar: T.warning,  fg: '#78350f' },
    error:   { bg: '#fde8e8', bar: T.error,    fg: '#7b1d1d' },
  };
  const col = colors[variant] || colors.info;
  const h = 44;
  let svg = rect(x, y, w, h, col.bg);
  svg += rect(x, y, 4, h, col.bar);
  svg += text(x + 16, y + h / 2 + 6, msg, 15, '400', col.fg);
  return { svg, height: h };
};

const renderInput = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const t = c.inputType || 'text';
  const h = 34;
  const inputW = c.inputWidth || 270;
  const iw = Math.min(inputW, w);
  let svg = rect(x, y, iw, h, '#fff', ` stroke="#a8a8a8" stroke-width="1"`);
  const placeholder = t === 'search' ? 'Search...' : t === 'textarea' ? 'Text area...' : 'Label';
  svg += text(x + 10, y + h / 2 + 5, placeholder, 14, '400', '#a8a8a8');
  if (t === 'date' || t === 'dropdown') {
    svg += text(x + iw - 22, y + h / 2 + 5, t === 'date' ? '📅' : '▾', 12, '400', T.fgMuted);
  }
  if (t === 'textarea') {
    const th = 80;
    let tsvg = rect(x, y, iw, th, '#fff', ` stroke="#a8a8a8" stroke-width="1"`);
    tsvg += text(x + 10, y + 20, 'Text area...', 14, '400', '#a8a8a8');
    return { svg: tsvg, height: th };
  }
  return { svg, height: h };
};

const renderDataGrid = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const cols = ['Name', 'ID Number', 'Amount', 'Percentage'];
  const rows = [
    ['John Smith', '123ABC', '1,234,567.89', '13.67%'],
    ['Jane Smith', '456ABC', '1,234,567.89', '59.00%'],
    ['John Doe',   '789ABC', '1,234,567.89', '47.25%'],
  ];
  const rowH = 36; const headerH = 40;
  const colW = Math.floor(w / cols.length);
  let svg = '';
  let cy = y;
  // Header row
  svg += rect(x, cy, w, headerH, T.secondary);
  cols.forEach((col, i) => {
    svg += text(x + i * colW + 10, cy + headerH / 2 + 5, col, 14, '600', T.fg);
  });
  cy += headerH;
  svg += line(x, cy, x + w, cy, T.border);
  rows.forEach((row, ri) => {
    const rowBg = ri % 2 === 0 ? '#fff' : '#fafafa';
    svg += rect(x, cy, w, rowH, rowBg);
    row.forEach((cell, ci) => {
      svg += text(x + ci * colW + 10, cy + rowH / 2 + 5, cell, 13, '400', T.fg);
    });
    cy += rowH;
    svg += line(x, cy, x + w, cy, T.border);
  });
  return { svg, height: cy - y };
};

const renderTreeList = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const rows: Array<{ label: string; depth: number }> = [
    { label: 'Row 1', depth: 0 },
    { label: 'Row 2', depth: 0 },
    { label: 'Child of Row 2', depth: 1 },
  ];
  const rowH = 36; const headerH = 36;
  let svg = '';
  let cy = y;
  svg += rect(x, cy, w, headerH, T.secondary);
  svg += text(x + 10, cy + headerH / 2 + 5, 'Name', 14, '600', T.fg);
  cy += headerH;
  svg += line(x, cy, x + w, cy, T.border);
  rows.forEach((row, ri) => {
    svg += rect(x, cy, w, rowH, ri % 2 === 0 ? '#fff' : '#fafafa');
    const indent = row.depth * 20;
    if (row.depth > 0) svg += text(x + 10 + indent - 14, cy + rowH / 2 + 5, '▸', 10, '400', T.fgMuted);
    svg += text(x + 10 + indent, cy + rowH / 2 + 5, row.label, 13, '400', T.fg);
    cy += rowH;
    svg += line(x, cy, x + w, cy, T.border);
  });
  return { svg, height: cy - y };
};

const renderChart = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const h = 200;
  let svg = rect(x, y, w, h, '#fff', ` stroke="${T.border}" stroke-width="1"`);
  const chartTypes: Record<string, string> = {
    stackedbar:   '▬ Stacked bar chart',
    stackedarea:  '〜 Stacked area chart',
    piechart:     '◔ Pie chart',
    densitycurve: '∿ Density curve',
    progressbar:  '▬ Progress bar',
    progressgauge:'◎ Progress gauge',
  };
  const label = chartTypes[c.type] || c.name;

  if (c.type === 'progressbar') {
    svg += text(x + w / 2, y + 50, '3 of 5', 32, '600', T.fg, 'middle');
    svg += text(x + w / 2, y + 72, 'Internal signoff', 14, '400', T.fg, 'middle');
    svg += rect(x + FRAME_PAD, y + 90, w - FRAME_PAD * 2, 17, T.border, ' rx="8"');
    svg += rect(x + FRAME_PAD, y + 90, (w - FRAME_PAD * 2) * 0.6, 17, T.primary, ' rx="8"');
    return { svg, height: 120 };
  }
  if (c.type === 'progressgauge') {
    const cx = x + w / 2; const cy2 = y + 80; const r = 50;
    svg += `<path d="M ${cx - r} ${cy2} a ${r} ${r} 0 0 1 ${r * 2} 0" fill="none" stroke="${T.border}" stroke-width="14" />`;
    svg += `<path d="M ${cx - r} ${cy2} a ${r} ${r} 0 0 1 ${r * 2} 0" fill="none" stroke="${T.primary}" stroke-width="14" stroke-dasharray="${Math.PI * r * 0.5} ${Math.PI * r}" />`;
    svg += text(cx, cy2 + 8, '50%', 28, '600', T.fg, 'middle');
    return { svg, height: 110 };
  }

  // Generic chart placeholder with mock bars / curves
  const barCount = 4; const barW = Math.floor((w - FRAME_PAD * 2) / barCount) - 8;
  const maxH = h - 60;
  const vals1 = [0.65, 0.45, 0.75, 0.55];
  const vals2 = [0.3, 0.25, 0.4, 0.2];
  const barColors = [T.primary, '#e31937'];

  if (c.type === 'stackedbar' || c.type === 'stackedarea') {
    vals1.forEach((v1, i) => {
      const bx = x + FRAME_PAD + i * (barW + 8);
      const h1 = Math.floor(maxH * v1);
      const h2 = Math.floor(maxH * vals2[i]);
      if (c.type === 'stackedbar') {
        svg += rect(bx, y + h - 30 - h1 - h2, barW, h2, barColors[1]);
        svg += rect(bx, y + h - 30 - h1, barW, h1, barColors[0]);
      }
    });
    if (c.type === 'stackedarea') {
      // Simple area shape
      const pts1 = vals1.map((v, i) => `${x + FRAME_PAD + i * (barW + 8) + barW / 2},${y + h - 30 - Math.floor(maxH * v)}`).join(' ');
      const bLine = `${x + FRAME_PAD}, ${y + h - 30} ${x + w - FRAME_PAD}, ${y + h - 30}`;
      svg += `<polygon points="${pts1} ${x + w - FRAME_PAD},${y + h - 30} ${x + FRAME_PAD},${y + h - 30}" fill="${T.primary}" opacity="0.3" />`;
      svg += `<polyline points="${pts1}" fill="none" stroke="${T.primary}" stroke-width="2" />`;
    }
  }
  if (c.type === 'piechart') {
    // Simple pie approximation
    const slices = [0.2, 0.25, 0.2, 0.18, 0.17];
    const colors = [T.primary, '#e31937', '#ff978a', '#fde5a7', '#200a58'];
    const pcx = x + w / 2; const pcy = y + h / 2; const pr = Math.min(w, h) / 2 - 30;
    let startAngle = -Math.PI / 2;
    slices.forEach((slice, i) => {
      const endAngle = startAngle + slice * Math.PI * 2;
      const x1 = pcx + pr * Math.cos(startAngle);
      const y1 = pcy + pr * Math.sin(startAngle);
      const x2 = pcx + pr * Math.cos(endAngle);
      const y2 = pcy + pr * Math.sin(endAngle);
      const large = slice > 0.5 ? 1 : 0;
      svg += `<path d="M ${pcx} ${pcy} L ${x1} ${y1} A ${pr} ${pr} 0 ${large} 1 ${x2} ${y2} Z" fill="${colors[i]}" />`;
      startAngle = endAngle;
    });
  }
  if (c.type === 'densitycurve') {
    const pts = [0.05, 0.12, 0.25, 0.48, 0.62, 0.55, 0.38, 0.2, 0.1, 0.04];
    const polyPts = pts.map((v, i) => {
      const px2 = x + FRAME_PAD + i * ((w - FRAME_PAD * 2) / (pts.length - 1));
      const py2 = y + h - 30 - Math.floor(maxH * v);
      return `${px2},${py2}`;
    }).join(' ');
    const fill = pts.map((v, i) => {
      const px2 = x + FRAME_PAD + i * ((w - FRAME_PAD * 2) / (pts.length - 1));
      const py2 = y + h - 30 - Math.floor(maxH * v);
      return `${px2},${py2}`;
    }).join(' ');
    svg += `<polygon points="${fill} ${x + w - FRAME_PAD},${y + h - 30} ${x + FRAME_PAD},${y + h - 30}" fill="${T.primary}" opacity="0.15" />`;
    svg += `<polyline points="${polyPts}" fill="none" stroke="${T.primary}" stroke-width="2.5" />`;
  }

  // Label
  svg += text(x + w / 2, y + 18, label, 14, '600', T.fg, 'middle');
  // Axis lines
  svg += line(x + FRAME_PAD, y + h - 30, x + w - FRAME_PAD, y + h - 30, T.border);
  return { svg, height: h };
};

const renderScheduler = (_c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const h = 480;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17];
  const headerH = 40; const hourH = 40; const timeColW = 48;
  const dayW = Math.floor((w - timeColW) / days.length);

  let svg = rect(x, y, w, h, '#fff', ` stroke="${T.border}" stroke-width="1"`);

  // Day headers
  svg += rect(x, y, w, headerH, T.secondary);
  svg += rect(x, y, timeColW, headerH, T.secondary);
  days.forEach((d, i) => {
    svg += text(x + timeColW + i * dayW + dayW / 2, y + headerH / 2 + 6, d, 13, '600', T.fg, 'middle');
    svg += line(x + timeColW + i * dayW, y, x + timeColW + i * dayW, y + h, T.border);
  });
  svg += line(x, y + headerH, x + w, y + headerH, T.border);

  // Hour rows
  hours.forEach((hr, i) => {
    const ry = y + headerH + i * hourH;
    svg += text(x + 4, ry + 14, `${hr}:00`, 11, '400', T.fgMuted);
    svg += line(x, ry, x + w, ry, T.border);
  });

  // Sample events
  const events = [
    { day: 0, hour: 9, duration: 0.5, label: 'Team Standup' },
    { day: 0, hour: 11, duration: 1,   label: 'Design Review' },
    { day: 1, hour: 10, duration: 1.5, label: 'Sprint Planning' },
    { day: 1, hour: 14, duration: 1,   label: 'Client Call' },
    { day: 2, hour: 8,  duration: 2,   label: 'Deployment Window' },
    { day: 3, hour: 15, duration: 1,   label: 'Retrospective' },
  ];
  events.forEach(ev => {
    const ex = x + timeColW + ev.day * dayW + 2;
    const ey = y + headerH + (ev.hour - 8) * hourH;
    const ew = dayW - 4;
    const eh = ev.duration * hourH - 2;
    svg += rect(ex, ey, ew, eh, '#e6e3f3', ` rx="2"`);
    svg += rect(ex, ey, 3, eh, T.primary, ` rx="1"`);
    if (eh >= 16) svg += text(ex + 7, ey + Math.min(16, eh / 2 + 5), ev.label, 11, '600', T.primary);
  });

  return { svg, height: h };
};

const renderDivider = (_c: DroppedComponent, x: number, y: number, w: number): Rendered => ({
  svg: line(x, y + 8, x + w, y + 8, '#d9d9d9'),
  height: 16,
});

const renderLabel = (c: DroppedComponent, x: number, y: number, _w: number): Rendered => {
  const label = c.name || 'Label';
  const lw = approxTextW(label, 13, '600') + 16;
  const h = 22;
  const bg = c.name.toLowerCase().includes('success') ? '#e3f8ee' :
             c.name.toLowerCase().includes('warning') ? '#fef3c7' :
             c.name.toLowerCase().includes('error')   ? '#fde8e8' :
             c.name.toLowerCase().includes('info')    ? '#e8f0fd' : T.secondary;
  const fg2 = c.name.toLowerCase().includes('success') ? T.success :
              c.name.toLowerCase().includes('warning') ? T.warning :
              c.name.toLowerCase().includes('error')   ? T.error   :
              c.name.toLowerCase().includes('info')    ? T.info    : T.fg;
  let svg = rect(x, y, lw, h, bg, ` stroke="${T.border}" stroke-width="1" rx="2"`);
  svg += text(x + 8, y + h / 2 + 5, label, 13, '600', fg2);
  return { svg, height: h };
};

const renderBadge = (c: DroppedComponent, x: number, y: number, _w: number): Rendered => {
  if (c.type === 'digitbadge') {
    const bw = 22; const h = 22;
    let svg = rect(x, y, bw, h, T.error, ' rx="11"');
    svg += text(x + bw / 2, y + h / 2 + 5, '3', 12, '700', '#fff', 'middle');
    return { svg, height: h };
  }
  return { svg: rect(x, y, 12, 12, T.primary, ' rx="6"'), height: 12 };
};

const renderCard = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const headerH = 52;
  let bodyH = 0;
  let bodyParts = '';
  let bcy = y + headerH + FRAME_PAD_V;
  const bodyW = w - FRAME_PAD * 2;

  (c.children || []).forEach(child => {
    const r = renderComponentSVG(child, x + FRAME_PAD, bcy, bodyW);
    bodyParts += r.svg;
    bcy += r.height + ROW_GAP;
    bodyH += r.height + ROW_GAP;
  });

  const totalH = headerH + FRAME_PAD_V * 2 + Math.max(bodyH, 40);
  let svg = rect(x, y, w, totalH, '#fff', ` stroke="${T.border}" stroke-width="1"`);
  // shadow hint
  svg += rect(x + 2, y + totalH, w - 2, 3, 'rgba(0,0,0,0.06)');
  svg += rect(x, y, w, headerH, '#fff');
  svg += line(x, y + headerH, x + w, y + headerH, T.border);
  svg += text(x + FRAME_PAD, y + headerH / 2 + 7, c.title || 'Card Title', 18, '600', T.fg);
  svg += bodyParts;
  return { svg, height: totalH };
};

const renderAccordion = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const sections = c.accordionSections || [];
  const sectionHeaderH = 52;
  let cy = y;
  let svg = '';

  sections.forEach((section, si) => {
    // Section header
    svg += rect(x, cy, w, sectionHeaderH, '#fff', ` stroke="${T.border}" stroke-width="1"`);
    svg += text(x + FRAME_PAD, cy + sectionHeaderH / 2 + 7, section.title || `Section ${si + 1}`, 18, '600', T.fg);
    svg += text(x + w - 28, cy + sectionHeaderH / 2 + 6, si === 0 ? '▴' : '▾', 14, '400', T.fgMuted);
    cy += sectionHeaderH;

    // Only expand first section
    if (si === 0 && (section.children || []).length > 0) {
      const contentY = cy;
      let contentH = FRAME_PAD_V;
      (section.children || []).forEach(child => {
        const r = renderComponentSVG(child, x + FRAME_PAD, cy + contentH, w - FRAME_PAD * 2);
        svg += r.svg;
        contentH += r.height + ROW_GAP;
      });
      contentH += FRAME_PAD_V;
      svg += rect(x, contentY, w, contentH, T.secondary, ` stroke="${T.border}" stroke-width="1"`);
      cy += contentH;
    }
  });
  return { svg, height: cy - y };
};

const renderTabs = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const sections = c.tabSections || [];
  const headerH = 48;
  let tabX = x + FRAME_PAD;
  let svg = rect(x, y, w, headerH, '#fff', ` stroke="${T.border}" stroke-width="1"`);

  sections.forEach((section, si) => {
    const label = section.title || `Tab ${si + 1}`;
    const tw = approxTextW(label, 16, '600') + 32;
    svg += text(tabX + tw / 2, y + headerH / 2 + 7, label, 16, '600', si === 0 ? T.primary : T.fg, 'middle');
    if (si === 0) svg += line(tabX, y + headerH - 1, tabX + tw, y + headerH - 1, T.primary, 3);
    tabX += tw;
  });
  svg += line(x, y + headerH, x + w, y + headerH, T.border);

  // Active tab content
  const activeChildren = (sections[0]?.children || []);
  let cy = y + headerH + FRAME_PAD_V;
  let contentH = FRAME_PAD_V;
  activeChildren.forEach(child => {
    const r = renderComponentSVG(child, x + FRAME_PAD, cy, w - FRAME_PAD * 2);
    svg += r.svg;
    cy += r.height + ROW_GAP;
    contentH += r.height + ROW_GAP;
  });
  contentH = Math.max(contentH + FRAME_PAD_V, 60);
  svg += rect(x, y + headerH, w, contentH, '#fff', ` stroke="${T.border}" stroke-width="1" stroke-top-width="0"`);
  return { svg, height: headerH + contentH };
};

const renderStepper = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  const steps = c.stepperSteps || [];
  const stepW = steps.length > 0 ? Math.floor(w / steps.length) : w;
  const h = 70;
  let svg = '';
  steps.forEach((step, i) => {
    const cx2 = x + i * stepW + stepW / 2;
    const cy2 = y + 24;
    const done = i === 0;
    const active = i === 1;
    const circleFill = done ? T.primary : '#fff';
    const circleStroke = done || active ? T.primary : '#a8a8a8';
    const textFill = done || active ? T.primary : T.fg;

    svg += `<circle cx="${cx2}" cy="${cy2}" r="14" fill="${circleFill}" stroke="${circleStroke}" stroke-width="1.5" />`;
    svg += text(cx2, cy2 + 5, done ? '✓' : String(i + 1), 13, '600', done ? '#fff' : textFill, 'middle');
    if (i < steps.length - 1) {
      const lx = cx2 + 16;
      svg += line(lx, cy2, x + (i + 1) * stepW + stepW / 2 - 16, cy2, done ? T.primary : '#a8a8a8');
    }
    svg += text(cx2, cy2 + 28, step.label || `Step ${i + 1}`, 13, '600', textFill, 'middle');
  });
  return { svg, height: h };
};

// ── Main per-component dispatcher ───────────────────────────────────────────
const renderComponentSVG = (c: DroppedComponent, x: number, y: number, w: number): Rendered => {
  if (c.type === 'button' || c.type === 'secondary-button' || c.type === 'tertiary-button') return renderButton(c, x, y, w);
  if (c.type.startsWith('segmented-')) return renderSegmented(c, x, y, w);
  if (c.type.startsWith('text-')) return renderText(c, x, y, w);
  if (c.type.startsWith('alert-') || c.alertVariant) return renderAlert(c, x, y, w);
  if (c.type === 'input-field') return renderInput(c, x, y, w);
  if (c.type === 'datagrid' || c.type === 'datagrid-expandable') return renderDataGrid(c, x, y, w);
  if (c.type === 'treelist') return renderTreeList(c, x, y, w);
  if (['stackedbar', 'stackedarea', 'piechart', 'densitycurve', 'progressbar', 'progressgauge'].includes(c.type)) return renderChart(c, x, y, w);
  if (c.type === 'scheduler') return renderScheduler(c, x, y, w);
  if (c.type === 'divider') return renderDivider(c, x, y, w);
  if (c.type === 'spacer') return { svg: rect(x, y, w, 16, 'transparent'), height: 16 };
  if (c.type === 'label') return renderLabel(c, x, y, w);
  if (c.type === 'digitbadge' || c.type === 'iconbadge' || c.type === 'statusbadge' || c.type === 'indicatorbadge') return renderBadge(c, x, y, w);
  if (c.type === 'card') return renderCard(c, x, y, w);
  if (c.type === 'accordion') return renderAccordion(c, x, y, w);
  if (c.type === 'tabs' || c.type === 'tabs-icons') return renderTabs(c, x, y, w);
  if (c.type === 'stepper' || c.type === 'verticalstepper') return renderStepper(c, x, y, w);
  // Fallback placeholder
  const ph = 48;
  let svg = rect(x, y, w, ph, T.secondary, ` stroke="${T.border}" stroke-width="1"`);
  svg += text(x + FRAME_PAD, y + ph / 2 + 6, c.name || c.type, 14, '400', T.fgMuted);
  return { svg, height: ph };
};

// ── Lay out one row of components (Bootstrap col-md-N grid) ─────────────────
const renderRow = (components: DroppedComponent[], rowX: number, rowY: number, totalW: number): { svg: string; height: number } => {
  const COLS = 12;
  let rowMaxH = 0;
  let rowSvg = '';

  // Group buttons that are adjacent into a flex row
  let i = 0;
  while (i < components.length) {
    const comp = components[i];
    const colSize = comp.colSize || 12;
    const compW = Math.floor((totalW / COLS) * colSize);
    const compX = rowX + components.slice(0, i).reduce((acc, c2) => {
      return acc + Math.floor((totalW / COLS) * (c2.colSize || 12));
    }, 0);

    const r = renderComponentSVG(comp, compX, rowY, compW);
    rowSvg += r.svg;
    rowMaxH = Math.max(rowMaxH, r.height);
    i++;
  }

  return { svg: rowSvg, height: rowMaxH };
};

// ── Build full SVG ───────────────────────────────────────────────────────────
export const buildFigmaFramesSVG = (pageName: string, components: DroppedComponent[]): string => {
  if (components.length === 0) return '';

  const OUTER_PAD = 40;
  let svgBody = '';
  let totalHeight = OUTER_PAD;

  components.forEach((comp, idx) => {
    const colSize = comp.colSize || 12;
    const fw = Math.floor(FRAME_WIDTH * (colSize / 12));
    const fx = OUTER_PAD;
    const fy = totalHeight;

    // Each top-level component is a named Figma "frame" (g with id)
    const r = renderComponentSVG(comp, fx, fy, fw);
    const frameLabel = `${comp.name || comp.type}${components.length > 1 ? ` ${idx + 1}` : ''}`;

    svgBody += `  <g id="${esc(frameLabel)}" data-name="${esc(frameLabel)}">\n`;
    svgBody += '    ' + r.svg.replace(/\n/g, '\n    ');
    svgBody += `\n  </g>\n`;

    totalHeight += r.height + FRAME_GAP;
  });

  const totalW = FRAME_WIDTH + OUTER_PAD * 2;

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalHeight}" viewBox="0 0 ${totalW} ${totalHeight}">\n` +
    `  <title>${esc(pageName)}</title>\n` +
    `  <!-- Generated by Page Builder — paste into Figma to create frames -->\n` +
    svgBody +
    `</svg>`
  );
};

// ── Copy SVG to clipboard (Figma-compatible) ─────────────────────────────────
export const copyFramesToClipboard = async (pageName: string, components: DroppedComponent[]): Promise<void> => {
  const svg = buildFigmaFramesSVG(pageName, components);
  if (!svg) throw new Error('No components to copy');

  // Try modern clipboard API first, fall back to execCommand
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    try {
      await navigator.clipboard.writeText(svg);
      return;
    } catch {
      // fall through to execCommand
    }
  }

  // execCommand fallback (works in sandboxed iframes where clipboard API is blocked)
  const ta = document.createElement('textarea');
  ta.value = svg;
  ta.style.position = 'fixed';
  ta.style.top = '-9999px';
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('execCommand copy failed');
};
