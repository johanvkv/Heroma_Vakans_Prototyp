import { DroppedComponent } from './pageBuilderTypes';

// ─── TSX (React) generation ───────────────────────────────────────────────────

const btnTSX = (c: DroppedComponent, ind: string): string => {
  const cls = c.type === 'secondary-button' ? 'btn-secondary' : c.type === 'tertiary-button' ? 'btn-tertiary' : 'btn-primary';
  const iconL = c.buttonIcon && c.buttonIconPosition === 'left' ? `<i className="fa-solid fa-${c.buttonIcon} btn-icon-left"></i>` : '';
  const iconR = c.buttonIcon && c.buttonIconPosition === 'right' ? `<i className="fa-solid fa-${c.buttonIcon} btn-icon-right"></i>` : '';
  return `${ind}<button className="${cls}">${iconL}${c.buttonText || 'Button'}${iconR}</button>\n`;
};

const textTSX = (c: DroppedComponent, ind: string): string => {
  if (c.type === 'text-list' && c.textContent) {
    const items = c.textContent.split('\n').filter(l => l.trim());
    return `${ind}<ul className="text-component text-list">\n${items.map(it => `${ind}  <li>${it}</li>`).join('\n')}\n${ind}</ul>\n`;
  }
  if (c.type === 'text-link' && c.textContent) return `${ind}<a href="#" className="text-component text-link">${c.textContent}</a>\n`;
  return `${ind}<p className="text-component">${c.textContent || ''}</p>\n`;
};

const inputTSX = (c: DroppedComponent, ind: string): string => {
  const t = c.inputType || 'text';
  if (t === 'textarea') return `${ind}<TextArea placeholder="Label" stylingMode="outlined" />\n`;
  if (t === 'dropdown') return `${ind}<SelectBox placeholder="Label" stylingMode="outlined" />\n`;
  if (t === 'date') return `${ind}<DateBox type="date" placeholder="Label" stylingMode="outlined" />\n`;
  if (t === 'time') return `${ind}<DateBox type="time" placeholder="Label" stylingMode="outlined" />\n`;
  if (t === 'search') return `${ind}<TextBox placeholder="Search..." stylingMode="outlined" />\n`;
  return `${ind}<TextBox placeholder="Label" stylingMode="outlined" />\n`;
};

// Returns the detail component declaration (to be emitted before the page component)
const gridDetailComponentTSX = (c: DroppedComponent): string => {
  if (c.type !== 'datagrid-expandable') return '';
  const detailMap = c.detailChildrenByRow || {};
  const hasDetail = Object.keys(detailMap).some(k => detailMap[k]?.length > 0);
  if (!hasDetail) return '';
  const detailCompName = `DetailView_${c.id.replace(/[^a-zA-Z0-9]/g, '_')}`;
  let g = `const ${detailCompName} = ({ data }: { data: any }) => {\n`;
  g += `  const rowKey = String(data?.data?.id ?? data?.key ?? '');\n`;
  g += `  return (\n`;
  g += `    <div className="datagrid-detail-content">\n`;
  Object.entries(detailMap).forEach(([rowKey, children]) => {
    if (!children || children.length === 0) return;
    g += `      {rowKey === '${rowKey}' && (\n`;
    g += `        <div className="row g-3">\n`;
    children.forEach(child => {
      g += generateComponentJSX(child, [], '          ');
    });
    g += `        </div>\n`;
    g += `      )}\n`;
  });
  g += `    </div>\n`;
  g += `  );\n`;
  g += `};\n\n`;
  return g;
};

const gridTSX = (c: DroppedComponent, ind: string): string => {
  const cols = c.gridData?.columns || [
    { dataField: 'col0', caption: 'Name' },
    { dataField: 'col1', caption: 'ID Number' },
    { dataField: 'col2', caption: 'Amount' },
  ];
  const isExpandable = c.type === 'datagrid-expandable';
  const detailMap = c.detailChildrenByRow || {};
  const hasDetail = isExpandable && Object.keys(detailMap).some(k => detailMap[k]?.length > 0);
  const detailCompName = `DetailView_${c.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

  let g = `${ind}<DataGrid\n`;
  g += `${ind}  dataSource={gridData}\n`;
  g += `${ind}  showBorders={false}\n`;
  g += `${ind}  showColumnLines={false}\n`;
  g += `${ind}  showRowLines={true}\n`;
  if (isExpandable) g += `${ind}  keyExpr="id"\n`;
  g += `${ind}>\n`;
  cols.forEach(col => { g += `${ind}  <Column dataField="${col.dataField}" caption="${col.caption}" />\n`; });
  if (isExpandable) {
    if (hasDetail) {
      g += `${ind}  <MasterDetail enabled={true} component={${detailCompName}} />\n`;
    } else {
      g += `${ind}  <MasterDetail enabled={true} render={() => <div className="datagrid-detail-content" />} />\n`;
    }
  }
  g += `${ind}  <Paging enabled={false} />\n`;
  g += `${ind}  <Scrolling mode="standard" />\n`;
  g += `${ind}</DataGrid>\n`;
  return g;
};

const treeTSX = (c: DroppedComponent, ind: string): string => {
  const rows = c.treeData && c.treeData.length > 0 ? c.treeData : [{ id: 1, parentId: null, name: 'Row 1' }, { id: 2, parentId: null, name: 'Row 2' }];
  return `${ind}<TreeList\n${ind}  dataSource={${JSON.stringify(rows)}}\n${ind}  keyExpr="id"\n${ind}  parentIdExpr="parentId"\n${ind}  rootValue={null}\n${ind}  showBorders={false}\n${ind}  showColumnLines={false}\n${ind}  showRowLines={true}\n${ind}>\n${ind}  <TreeColumn dataField="name" caption="Name" />\n${ind}  <TreePaging enabled={false} />\n${ind}  <TreeScrolling mode="standard" />\n${ind}</TreeList>\n`;
};

const cardBodyTSX = (children: DroppedComponent[], ind: string): string => {
  if (!children || children.length === 0) return `${ind}<p>No content</p>\n`;
  let out = '';
  children.forEach((c, idx) => {
    const isBtn = c.type === 'button' || c.type === 'secondary-button' || c.type === 'tertiary-button' || c.type.startsWith('segmented-');
    const prevIsBtn = idx > 0 && (() => { const p = children[idx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
    if (isBtn) {
      out += `${ind}<div className="${prevIsBtn ? 'col-auto' : 'col-auto ms-auto'}" className="btn-col-wrapper">\n`;
      if (c.type.startsWith('segmented-')) out += segTSX(c, ind + '  ');
      else out += btnTSX(c, ind + '  ');
      out += `${ind}</div>\n`;
    } else if (c.type === 'treelist') {
      out += treeTSX(c, ind);
    } else if (c.type === 'datagrid' || c.type === 'datagrid-expandable') {
      out += gridTSX(c, ind);
    } else if (c.type.startsWith('text-')) {
      out += textTSX(c, ind);
    } else if (c.type === 'input-field') {
      out += inputTSX(c, ind);
    } else if (c.type.startsWith('alert-') || c.alertVariant) {
      out += alertTSX(c, ind);
    } else if (CHART_TYPES.includes(c.type)) {
      out += chartTSX(c, ind);
    } else {
      out += `${ind}{/* ${c.name} */}\n`;
    }
  });
  return out;
};

const alertTSX = (c: DroppedComponent, ind: string): string => {
  const variant = c.alertVariant || (c.type.startsWith('alert-') ? c.type.replace('alert-', '') : 'info');
  const msg = c.alertMessage || `This is a${variant === 'error' ? 'n' : ''} ${variant} alert`;
  const link = c.showAlertLink ? `\n${ind}  showLink={true}` : '';
  return `${ind}<Alert variant="${variant}" message="${msg}"${link} />\n`;
};

const chartDataVars = {
  stackedbar: `const stackedBarData = [
  { quarter: 'Q1', series1: 8000, series2: 5000 },
  { quarter: 'Q2', series1: 6000, series2: 4500 },
  { quarter: 'Q3', series1: 7000, series2: 7000 },
  { quarter: 'Q4', series1: 5500, series2: 2500 },
];`,
  stackedarea: `const stackedAreaData = [
  { month: 'Apr', series1: 30, series2: 20, series3: 15, series4: 10 },
  { month: 'May', series1: 35, series2: 18, series3: 12, series4: 8 },
  { month: 'Jun', series1: 25, series2: 22, series3: 18, series4: 12 },
  { month: 'Jul', series1: 40, series2: 15, series3: 10, series4: 15 },
];`,
  piechart: `const pieChartData = [
  { category: 'A', value: 20 },
  { category: 'B', value: 25 },
  { category: 'C', value: 20 },
  { category: 'D', value: 18 },
  { category: 'E', value: 17 },
];`,
  densitycurve: `const densityCurveData = [
  { x: 1, y: 5 }, { x: 2, y: 12 }, { x: 3, y: 20 }, { x: 4, y: 35 },
  { x: 5, y: 48 }, { x: 6, y: 52 }, { x: 7, y: 45 }, { x: 8, y: 30 },
  { x: 9, y: 18 }, { x: 10, y: 8 }, { x: 11, y: 3 },
];`,
};

const chartTSX = (c: DroppedComponent, ind: string): string => {
  const i2 = ind + '  ';
  const i3 = ind + '    ';
  const colSize = c.colSize || 12;

  if (c.type === 'stackedbar') {
    return (
      `${ind}<div className="col-md-${colSize}">\n` +
      `${i2}<div className="chart-card">\n` +
      `${i3}<h3 className="chart-title">Stacked bar chart</h3>\n` +
      `${i3}<Chart dataSource={stackedBarData} className="chart-standard">\n` +
      `${i3}  <CommonSeriesSettings argumentField="quarter" type="stackedbar" />\n` +
      `${i3}  <Series valueField="series1" name="Series 1" color="#5236ab" />\n` +
      `${i3}  <Series valueField="series2" name="Series 2" color="#e31937" />\n` +
      `${i3}  <ArgumentAxis />\n` +
      `${i3}  <ValueAxis />\n` +
      `${i3}  <Legend verticalAlignment="bottom" horizontalAlignment="center" itemTextPosition="right" />\n` +
      `${i3}</Chart>\n` +
      `${i2}</div>\n` +
      `${ind}</div>\n`
    );
  }

  if (c.type === 'stackedarea') {
    return (
      `${ind}<div className="col-md-${colSize}">\n` +
      `${i2}<div className="chart-card">\n` +
      `${i3}<h3 className="chart-title">Stacked area chart</h3>\n` +
      `${i3}<Chart dataSource={stackedAreaData} className="chart-standard">\n` +
      `${i3}  <CommonSeriesSettings argumentField="month" type="stackedarea" />\n` +
      `${i3}  <Series valueField="series1" name="Series 1" color="#5236ab" />\n` +
      `${i3}  <Series valueField="series2" name="Series 2" color="#e31937" />\n` +
      `${i3}  <Series valueField="series3" name="Series 3" color="#ff978a" />\n` +
      `${i3}  <Series valueField="series4" name="Series 4" color="#fde5a7" />\n` +
      `${i3}  <ArgumentAxis />\n` +
      `${i3}  <ValueAxis valueMarginsEnabled={false} />\n` +
      `${i3}  <Legend verticalAlignment="bottom" horizontalAlignment="center" itemTextPosition="right" />\n` +
      `${i3}</Chart>\n` +
      `${i2}</div>\n` +
      `${ind}</div>\n`
    );
  }

  if (c.type === 'piechart') {
    const colors = `['#5236ab','#e31937','#ff978a','#fde5a7','#200a58']`;
    return (
      `${ind}<div className="col-md-${colSize}">\n` +
      `${i2}<div className="chart-card">\n` +
      `${i3}<h3 className="chart-title">Pie chart</h3>\n` +
      `${i3}<PieChart dataSource={pieChartData} palette={${colors}} className="chart-standard">\n` +
      `${i3}  <PieSeries argumentField="category" valueField="value">\n` +
      `${i3}    <PieLabel visible={true} position="inside" />\n` +
      `${i3}  </PieSeries>\n` +
      `${i3}  <Legend verticalAlignment="bottom" horizontalAlignment="center" itemTextPosition="right" />\n` +
      `${i3}</PieChart>\n` +
      `${i2}</div>\n` +
      `${ind}</div>\n`
    );
  }

  if (c.type === 'densitycurve') {
    return (
      `${ind}<div className="col-md-${colSize}">\n` +
      `${i2}<div className="chart-card">\n` +
      `${i3}<h3 className="chart-title">Density curve</h3>\n` +
      `${i3}<Chart dataSource={densityCurveData} className="chart-standard">\n` +
      `${i3}  <CommonSeriesSettings argumentField="x" type="spline" />\n` +
      `${i3}  <Series valueField="y" name="Density" color="#5236ab" />\n` +
      `${i3}  <ArgumentAxis />\n` +
      `${i3}  <ValueAxis />\n` +
      `${i3}  <Legend visible={false} />\n` +
      `${i3}</Chart>\n` +
      `${i2}</div>\n` +
      `${ind}</div>\n`
    );
  }

  if (c.type === 'progressbar') {
    return (
      `${ind}<div className="col-md-${colSize}">\n` +
      `${i2}<div className="chart-card">\n` +
      `${i3}<div className="progress-chart-container">\n` +
      `${i3}  <div className="progress-chart-value">3 of 5</div>\n` +
      `${i3}  <div className="progress-chart-label">Internal signoff</div>\n` +
      `${i3}  <div className="progress-bar-wrapper">\n` +
      `${i3}    <div className="progress-bar-track">\n` +
      `${i3}      <div className="progress-bar-fill" style={{ width: '60%' }}></div>\n` +
      `${i3}    </div>\n` +
      `${i3}  </div>\n` +
      `${i3}</div>\n` +
      `${i2}</div>\n` +
      `${ind}</div>\n`
    );
  }

  if (c.type === 'progressgauge') {
    return (
      `${ind}<div className="col-md-${colSize}">\n` +
      `${i2}<div className="chart-card">\n` +
      `${i3}<div className="gauge-chart-container">\n` +
      `${i3}  <div className="gauge-donut">\n` +
      `${i3}    <svg className="gauge-svg" viewBox="0 0 159 159">\n` +
      `${i3}      <path d="M 79.5 79.5 m -59.5 0 a 59.5 59.5 0 0 1 119 0" fill="none" stroke="#efefef" strokeWidth="20" />\n` +
      `${i3}    </svg>\n` +
      `${i3}    <svg className="gauge-svg gauge-svg-foreground" viewBox="0 0 159 159">\n` +
      `${i3}      <path d="M 79.5 79.5 m -59.5 0 a 59.5 59.5 0 0 1 119 0" fill="none" stroke="#5236ab" strokeWidth="20" strokeDasharray="93.5 187" strokeLinecap="butt" />\n` +
      `${i3}    </svg>\n` +
      `${i3}    <div className="gauge-text"><span>50%</span></div>\n` +
      `${i3}  </div>\n` +
      `${i3}</div>\n` +
      `${i2}</div>\n` +
      `${ind}</div>\n`
    );
  }

  return `${ind}<div className="col-md-${colSize}">{/* ${c.name} */}</div>\n`;
};

const CHART_TYPES = ['stackedbar', 'stackedarea', 'piechart', 'densitycurve', 'progressbar', 'progressgauge'];

const segTSX = (c: DroppedComponent, ind: string): string => {
  const options = ['Walk', 'Train', 'Car'];
  const icons = c.segmentedButtonIcons || [];
  let out = `${ind}<div className="segmented-buttons">\n`;
  options.forEach((opt, idx) => {
    const icoEl = icons[idx] && c.type !== 'segmented-text' ? `<i className="fa-solid fa-${icons[idx]} segmented-button-icon"></i>` : '';
    const chkEl = idx === 0 && c.type !== 'segmented-text' ? `<i className="fa-solid fa-check segmented-button-check"></i>` : '';
    const label = c.type !== 'segmented-icons' ? `<span>${opt}</span>` : '';
    const sel = idx === 0 ? ' segmented-button-selected' : '';
    const pos = idx === 0 ? ' segmented-button-first' : idx === options.length - 1 ? ' segmented-button-last' : '';
    out += `${ind}  <button className="segmented-button${sel}${pos}">${icoEl}${chkEl}${label}</button>\n`;
  });
  return out + `${ind}</div>\n`;
};

// ── Sidebar TSX generator ─────────────────────────────────────────────────────

const sidebarTSX = (comp: DroppedComponent, i: string, colSize: number): string => {
  const i2 = i + '  ';
  const i3 = i + '    ';
  const i4 = i + '      ';
  const i5 = i + '        ';

  // Build navData JSON — use actual user-built nav or fallback to default
  const navData = comp.sidebarNavData && comp.sidebarNavData.length > 0
    ? comp.sidebarNavData
    : [
        { id: '1', text: 'Dashboard' },
        { id: '2', text: 'Components', children: [
            { id: '2-1', text: 'Alerts' },
            { id: '2-2', text: 'Navigation' },
            { id: '2-3', text: 'Tooltips' },
        ]},
        { id: '3', text: 'Patterns' },
      ];
  const navDataStr = JSON.stringify(navData, null, 2).replace(/^/gm, i2);
  const selectedId = comp.selectedMenuItem || (navData[0] as any)?.id || '1';

  // Build content areas from sidebarContent
  const content = comp.sidebarContent || {};
  const contentKeys = Object.keys(content);

  let out = `${i}<div className="col-md-${colSize}">\n`;
  out += `${i2}<div className="sidebar-content-layout">\n`;

  // Nav sidebar
  out += `${i3}<div className="nav-sidebar">\n`;
  navData.forEach((item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    out += `${i4}<div className="nav-sidebar-item">\n`;
    out += `${i5}<span className="nav-sidebar-item-text">${item.text}</span>\n`;
    if (hasChildren) {
      out += `${i5}<i className="fa-solid fa-chevron-down nav-sidebar-icon"></i>\n`;
    }
    out += `${i4}</div>\n`;
    if (hasChildren) {
      out += `${i4}<div className="nav-sidebar-children">\n`;
      item.children.forEach((child: any) => {
        out += `${i5}<div className="nav-sidebar-child-item">${child.text}</div>\n`;
      });
      out += `${i4}</div>\n`;
    }
  });
  out += `${i3}</div>\n`;

  // Content area — one section per selectedMenuItem key or show first
  out += `${i3}<div className="sidebar-content-area">\n`;
  if (contentKeys.length > 0) {
    // Emit a conditional block per menu item
    contentKeys.forEach(menuId => {
      const items = content[menuId] || [];
      if (items.length === 0) return;
      out += `${i4}{/* Content for menu item: ${menuId} */}\n`;
      out += `${i4}<div className="row g-3">\n`;
      items.forEach(child => {
        out += generateComponentJSX(child, [], i5);
      });
      out += `${i4}</div>\n`;
    });
  } else {
    out += `${i4}{/* Drop components into the sidebar content area */}\n`;
  }
  out += `${i3}</div>\n`;

  out += `${i2}</div>\n`;
  out += `${i}</div>\n`;
  return out;
};

// ── Sidebar data variable emitter ─────────────────────────────────────────────

const buildSidebarNavVar = (comp: DroppedComponent): string => {
  const navData = comp.sidebarNavData && comp.sidebarNavData.length > 0
    ? comp.sidebarNavData
    : [
        { id: '1', text: 'Dashboard' },
        { id: '2', text: 'Components', children: [
            { id: '2-1', text: 'Alerts' },
            { id: '2-2', text: 'Navigation' },
        ]},
        { id: '3', text: 'Patterns' },
      ];
  return `const sidebarNavData = ${JSON.stringify(navData, null, 2)};\n`;
};

// Generate full React JSX for a single component (recursive, DevExtreme-aware)
export const generateComponentJSX = (comp: DroppedComponent, allComponents: DroppedComponent[], indent: string): string => {
  const i = indent;
  const i2 = indent + '  ';
  const i3 = indent + '    ';
  const i4 = indent + '      ';
  const colSize = comp.colSize || 12;

  if (comp.type === 'card') {
    let out = `${i}<div className="col-md-${colSize}">\n`;
    out += `${i2}<div className="card-standard">\n`;
    out += `${i3}<div className="card-header-wrapper">\n`;
    out += `${i4}<h2 className="card-title-standard">${comp.title || 'Card Title'}</h2>\n`;
    out += `${i3}</div>\n${i3}<div className="card-body-standard">\n${i3}  <div className="row g-0">\n`;
    out += cardBodyTSX(comp.children || [], i4 + '  ');
    out += `${i3}  </div>\n${i3}</div>\n${i2}</div>\n${i}</div>\n`;
    return out;
  }

  if (comp.type === 'button' || comp.type === 'secondary-button' || comp.type === 'tertiary-button') {
    const idx = allComponents.indexOf(comp);
    const prev = idx > 0 && (() => { const p = allComponents[idx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
    return `${i}<div className="${prev ? 'col-auto' : 'col-auto ms-auto'}" className="btn-col-wrapper">\n${btnTSX(comp, i2)}${i}</div>\n`;
  }

  if (comp.type.startsWith('segmented-')) {
    const idx = allComponents.indexOf(comp);
    const prev = idx > 0 && (() => { const p = allComponents[idx - 1]; return p.type === 'button' || p.type === 'secondary-button' || p.type === 'tertiary-button' || p.type.startsWith('segmented-'); })();
    return `${i}<div className="${prev ? 'col-auto' : 'col-auto ms-auto'}" className="btn-col-wrapper">\n${segTSX(comp, i2)}${i}</div>\n`;
  }

  if (comp.type.startsWith('text-')) return `${i}<div className="col-md-${colSize}">\n${textTSX(comp, i2)}${i}</div>\n`;
  if (comp.type === 'input-field') return `${i}<div className="col-md-${comp.colSize || 4}">\n${inputTSX(comp, i2)}${i}</div>\n`;
  if (comp.type === 'datagrid' || comp.type === 'datagrid-expandable') return `${i}<div className="col-md-${colSize}">\n${gridTSX(comp, i2)}${i}</div>\n`;
  if (comp.type === 'treelist') return `${i}<div className="col-md-${colSize}">\n${treeTSX(comp, i2)}${i}</div>\n`;

  if (comp.type === 'tabs' || comp.type === 'tabs-icons') {
    const sections = comp.tabSections || [];
    let out = `${i}<div className="col-md-${colSize}">\n${i2}<div className="tabs-container">\n${i3}<div className="tabs-header">\n`;
    sections.forEach(s => { out += `${i4}<button className="tab-title">${s.title}</button>\n`; });
    out += `${i3}</div>\n${i3}<div className="tabs-line"></div>\n${i3}<div className="tab-content-area">\n`;
    sections.forEach(s => {
      out += `${i4}<div className="tab-dropped-children">\n${i4}  <div className="row g-3">\n`;
      (s.children || []).forEach(c => { out += generateComponentJSX(c, allComponents, i4 + '    '); });
      out += `${i4}  </div>\n${i4}</div>\n`;
    });
    return out + `${i3}</div>\n${i2}</div>\n${i}</div>\n`;
  }

  if (comp.type === 'accordion') {
    const sections = comp.accordionSections || [];
    let out = `${i}<div className="col-md-${colSize}">\n${i2}<div className="accordion-container">\n`;
    sections.forEach(s => {
      out += `${i3}<div className="accordion-section">\n`;
      out += `${i4}<div className="accordion-title">${s.title}</div>\n`;
      out += `${i4}<div className="accordion-content">\n`;
      (s.children || []).forEach(c => { out += generateComponentJSX(c, allComponents, i4 + '  '); });
      out += `${i4}</div>\n${i3}</div>\n`;
    });
    return out + `${i2}</div>\n${i}</div>\n`;
  }

  if (comp.type === 'stepper' || comp.type === 'verticalstepper') {
    const steps = comp.stepperSteps || [];
    const isVertical = comp.type === 'verticalstepper';
    let out = `${i}<div className="col-md-${colSize}">\n${i2}<div className="${isVertical ? 'stepper-vertical' : 'stepper-horizontal'}">\n`;
    steps.forEach((s, idx) => {
      out += `${i3}<div className="${isVertical ? 'stepper-vertical-step' : 'stepper-horizontal-step'}">\n`;
      out += `${i4}<div className="stepper-horizontal-circle">${idx + 1}</div>\n`;
      out += `${i4}<div className="stepper-horizontal-label">${s.label || `Step ${idx + 1}`}</div>\n`;
      if (s.children && s.children.length > 0) {
        out += `${i4}<div className="row g-3">\n`;
        s.children.forEach(c => { out += generateComponentJSX(c, allComponents, i4 + '  '); });
        out += `${i4}</div>\n`;
      }
      out += `${i3}</div>\n`;
    });
    return out + `${i2}</div>\n${i}</div>\n`;
  }

  if (comp.type === 'scheduler') {
    const events = comp.schedulerEvents || [];
    const view = comp.schedulerView || 'week';
    const currentDate = comp.schedulerCurrentDate || '2025-01-13';
    let out = `${i}<div className="col-md-${colSize}">\n`;
    out += `${i2}<Scheduler\n`;
    out += `${i3}dataSource={schedulerEvents}\n`;
    out += `${i3}currentView="${view}"\n`;
    out += `${i3}defaultCurrentDate={new Date('${currentDate}')}\n`;
    out += `${i3}height={580}\n`;
    out += `${i3}startDayHour={8}\n`;
    out += `${i3}endDayHour={20}\n`;
    out += `${i3}showAllDayPanel={true}\n`;
    out += `${i3}textExpr="text"\n`;
    out += `${i3}startDateExpr="startDate"\n`;
    out += `${i3}endDateExpr="endDate"\n`;
    out += `${i3}allDayExpr="allDay"\n`;
    out += `${i2}>\n`;
    out += `${i3}<View type="day" />\n`;
    out += `${i3}<View type="week" />\n`;
    out += `${i3}<View type="month" />\n`;
    out += `${i3}<View type="agenda" />\n`;
    out += `${i2}</Scheduler>\n`;
    out += `${i}</div>\n`;
    return out;
  }

  if (comp.type === 'spacer') return `${i}<div className="col-md-12"><div className="spacer"></div></div>\n`;
  if (comp.type === 'divider') return `${i}<div className="col-md-12"><hr className="divider" /></div>\n`;

  if (comp.type.startsWith('alert-') || comp.alertVariant) {
    return `${i}<div className="col-md-${colSize}">\n${alertTSX(comp, i2)}${i}</div>\n`;
  }

  if (CHART_TYPES.includes(comp.type)) {
    return chartTSX(comp, i);
  }

  if (comp.type === 'text-search') {
    return `${i}<div className="col-md-${colSize}">\n${i2}<div className="text-search-wrapper">\n${i3}<input type="text" className="text-search-input" placeholder="Search..." />\n${i2}</div>\n${i}</div>\n`;
  }

  if (comp.type === 'sidebar') {
    return sidebarTSX(comp, i, colSize);
  }

  if (comp.type === 'label') {
    const labelCls = comp.name.toLowerCase().includes('subtle') ? 'label-subtle' :
                     comp.name.toLowerCase().includes('info') ? 'label-info' :
                     comp.name.toLowerCase().includes('success') ? 'label-success' :
                     comp.name.toLowerCase().includes('warning') ? 'label-warning' :
                     comp.name.toLowerCase().includes('error') ? 'label-error' : 'label-default';
    return `${i}<div className="col-auto">\n${i2}<span className="label ${labelCls}">${comp.name}</span>\n${i}</div>\n`;
  }

  if (comp.type === 'digitbadge') {
    return `${i}<div className="col-auto">\n${i2}<span className="digit-badge">{count}</span>\n${i}</div>\n`;
  }

  if (comp.type === 'iconbadge' || comp.type === 'statusbadge' || comp.type === 'indicatorbadge') {
    const cls = comp.type === 'iconbadge' ? 'icon-badge' : comp.type === 'statusbadge' ? 'status-badge' : 'indicator-badge';
    return `${i}<div className="col-auto">\n${i2}<span className="${cls}">{/* ${comp.name} */}</span>\n${i}</div>\n`;
  }

  if (comp.type === 'menu') {
    return `${i}<div className="col-auto">\n${i2}<button className="btn-tertiary" onClick={() => {}}>\n${i3}<i className="fa-solid fa-ellipsis-vertical"></i>\n${i2}</button>\n${i}</div>\n`;
  }

  return `${i}<div className="col-md-${colSize}">{/* ${comp.name} */}</div>\n`;
};

// ─── Import collection ────────────────────────────────────────────────────────

export const collectImports = (components: DroppedComponent[]): string => {
  const needs = {
    DataGrid: false, MasterDetail: false, TreeList: false, Scheduler: false,
    TextBox: false, TextArea: false, DateBox: false, SelectBox: false,
    Chart: false, PieChart: false, Alert: false,
  };
  const walk = (list: DroppedComponent[]) => {
    list.forEach(c => {
      if (c.type === 'datagrid' || c.type === 'datagrid-expandable') needs.DataGrid = true;
      if (c.type === 'datagrid-expandable') needs.MasterDetail = true;
      if (c.type === 'treelist') needs.TreeList = true;
      if (c.type === 'scheduler') needs.Scheduler = true;
      if (c.type === 'stackedbar' || c.type === 'stackedarea' || c.type === 'densitycurve') needs.Chart = true;
      if (c.type === 'piechart') needs.PieChart = true;
      if (c.type.startsWith('alert-') || c.alertVariant) needs.Alert = true;
      // sidebar generates raw JSX — no special import needed
      if (c.type === 'input-field') {
        const t = c.inputType || 'text';
        if (t === 'textarea') needs.TextArea = true;
        else if (t === 'dropdown') needs.SelectBox = true;
        else if (t === 'date' || t === 'time') needs.DateBox = true;
        else needs.TextBox = true;
      }
      if (c.children) walk(c.children);
      if (c.accordionSections) c.accordionSections.forEach(s => walk(s.children || []));
      if (c.tabSections) c.tabSections.forEach(s => { walk(s.children || []); s.children?.forEach(ch => { if (ch.children) walk(ch.children); }); });
      if (c.stepperSteps) c.stepperSteps.forEach(s => walk(s.children || []));
    });
  };
  walk(components);
  let imports = `import React from 'react';\n`;
  if (needs.DataGrid) imports += `import DataGrid, { Column, Paging, Scrolling, ColumnChooser, Selection, SearchPanel${needs.MasterDetail ? ', MasterDetail' : ''} } from 'devextreme-react/data-grid';\n`;
  if (needs.TreeList) imports += `import TreeList, { Column as TreeColumn, Paging as TreePaging, Scrolling as TreeScrolling } from 'devextreme-react/tree-list';\n`;
  if (needs.Scheduler) imports += `import Scheduler, { View } from 'devextreme-react/scheduler';\n`;
  if (needs.Chart) imports += `import Chart, { Series, ArgumentAxis, ValueAxis, Legend, CommonSeriesSettings } from 'devextreme-react/chart';\n`;
  if (needs.PieChart) imports += `import PieChart, { Series as PieSeries, Legend as PieLegend, Label as PieLabel } from 'devextreme-react/pie-chart';\n`;
  if (needs.Alert) imports += `import { Alert } from './components/Alert';\n`;
  // NavigationSidebar no longer needed — sidebar generates raw JSX
  if (needs.TextBox) imports += `import TextBox from 'devextreme-react/text-box';\n`;
  if (needs.TextArea) imports += `import TextArea from 'devextreme-react/text-area';\n`;
  if (needs.DateBox) imports += `import DateBox from 'devextreme-react/date-box';\n`;
  if (needs.SelectBox) imports += `import SelectBox from 'devextreme-react/select-box';\n`;
  return imports;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const walkForTypes = (list: DroppedComponent[], types: string[]): boolean =>
  list.some(c => types.includes(c.type) ||
    walkForTypes(c.children || [], types) ||
    (c.accordionSections || []).some(s => walkForTypes(s.children || [], types)) ||
    (c.tabSections || []).some(s => walkForTypes(s.children || [], types)) ||
    (c.stepperSteps || []).some(s => walkForTypes(s.children || [], types))
  );

// ─── Main export builder ──────────────────────────────────────────────────────

export const buildExportCode = (pageName: string, droppedComponents: DroppedComponent[], locationName?: string): string => {
  const name = pageName || 'Untitled Page';
  const componentName = name.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join('').replace(/\W/g, '') || 'UntitledPage';

  const separator = (label: string) =>
    `\n// ${'─'.repeat(70)}\n// ${label}\n// ${'─'.repeat(70)}\n\n`;

  // ── TSX React component ──
  let output = `// Generated from Page Builder — ${name}\n`;
  output += `//\n`;
  output += `// TODO (required to wire this page into the app):\n`;
  output += `//   1) Add "${name}" to the DATA-DRIVEN menu: src/data/menu.json,\n`;
  output += `//      under the "${locationName || 'intended'}" primary, with a "path".\n`;
  output += `//   2) Register a route for it in src/app/routes.tsx.\n`;
  output += `//   The menu is data-driven: the live nav (MegaMenu) AND the Page Builder placement\n`;
  output += `//   both read menu.json — do NOT hardcode menu items in MegaMenu.tsx.\n`;
  output += separator('REACT COMPONENT (TSX)');
  output += collectImports(droppedComponents);
  output += '\n';

  // emit chart data constants
  const chartTypeMap: Array<[string[], keyof typeof chartDataVars]> = [
    [['stackedbar'], 'stackedbar'],
    [['stackedarea'], 'stackedarea'],
    [['piechart'], 'piechart'],
    [['densitycurve'], 'densitycurve'],
  ];
  chartTypeMap.forEach(([types, key]) => {
    if (walkForTypes(droppedComponents, types)) output += chartDataVars[key] + '\n\n';
  });

  const hasScheduler = walkForTypes(droppedComponents, ['scheduler']);
  if (hasScheduler) {
    output += `const schedulerEvents = [\n`;
    output += `  { id: 1,  text: 'Team Standup',      startDate: '2025-01-13T09:00:00', endDate: '2025-01-13T09:30:00' },\n`;
    output += `  { id: 2,  text: 'Design Review',      startDate: '2025-01-13T11:00:00', endDate: '2025-01-13T12:00:00' },\n`;
    output += `  { id: 3,  text: 'Sprint Planning',    startDate: '2025-01-14T10:00:00', endDate: '2025-01-14T11:30:00' },\n`;
    output += `  { id: 4,  text: 'Client Call',        startDate: '2025-01-14T14:00:00', endDate: '2025-01-14T15:00:00' },\n`;
    output += `  { id: 5,  text: 'Deployment Window',  startDate: '2025-01-15T08:00:00', endDate: '2025-01-15T10:00:00' },\n`;
    output += `  { id: 6,  text: 'Retrospective',      startDate: '2025-01-16T15:00:00', endDate: '2025-01-16T16:00:00' },\n`;
    output += `  { id: 7,  text: 'All-day Conference', startDate: '2025-01-17T00:00:00', endDate: '2025-01-17T23:59:00', allDay: true },\n`;
    output += `];\n\n`;
  }

  const gridComp = droppedComponents.find(c => c.type === 'datagrid' || c.type === 'datagrid-expandable');
  if (gridComp) {
    const rows = gridComp.gridData?.data || [
      { id: 1, col0: 'John Smith',  col1: '123ABC', col2: '1,234.00' },
      { id: 2, col0: 'Jane Smith',  col1: '456ABC', col2: '2,345.00' },
      { id: 3, col0: 'John Doe',    col1: '789ABC', col2: '3,456.00' },
    ];
    output += `const gridData = ${JSON.stringify(rows, null, 2)};\n\n`;
  }

  const sidebarComp = droppedComponents.find(c => c.type === 'sidebar');
  if (sidebarComp) {
    output += buildSidebarNavVar(sidebarComp);
    output += '\n';
  }

  // Emit detail view components for expandable grids (must be outside the page component)
  const emitDetailComponents = (list: DroppedComponent[]) => {
    list.forEach(c => {
      if (c.type === 'datagrid-expandable') {
        const decl = gridDetailComponentTSX(c);
        if (decl) output += decl;
      }
      if (c.children) emitDetailComponents(c.children);
      if (c.accordionSections) c.accordionSections.forEach(s => emitDetailComponents(s.children || []));
      if (c.tabSections) c.tabSections.forEach(s => emitDetailComponents(s.children || []));
      if (c.stepperSteps) c.stepperSteps.forEach(s => emitDetailComponents(s.children || []));
    });
  };
  emitDetailComponents(droppedComponents);

  output += `export const ${componentName} = () => {\n`;
  output += `  return (\n`;
  output += `    <div className="container-fluid">\n`;
  output += `      <div className="row g-3">\n`;
  droppedComponents.forEach(comp => {
    output += generateComponentJSX(comp, droppedComponents, '        ');
  });
  output += `      </div>\n    </div>\n  );\n};\n`;

  // ── CSS ──
  const hasStepper    = walkForTypes(droppedComponents, ['stepper', 'verticalstepper']);
  const hasCard       = walkForTypes(droppedComponents, ['card']);
  const hasTabs       = walkForTypes(droppedComponents, ['tabs', 'tabs-icons']);
  const hasAccordion  = walkForTypes(droppedComponents, ['accordion']);
  const hasInput      = walkForTypes(droppedComponents, ['input-field']);
  const hasAlert      = walkForTypes(droppedComponents, ['alert-info', 'alert-warning', 'alert-error', 'alert-success']) ||
                        droppedComponents.some(c => !!c.alertVariant);
  const hasChart      = walkForTypes(droppedComponents, CHART_TYPES);
  const hasDivider    = walkForTypes(droppedComponents, ['divider']);
  const hasLabel      = walkForTypes(droppedComponents, ['label']);
  const hasBadge      = walkForTypes(droppedComponents, ['digitbadge', 'iconbadge', 'statusbadge', 'indicatorbadge']);
  const hasSeg        = walkForTypes(droppedComponents, ['segmented-text', 'segmented-icons', 'segmented-mixed']);
  const hasText       = walkForTypes(droppedComponents, ['text-heading', 'text-subheading', 'text-paragraph', 'text-list', 'text-link']);
  const hasScheduler2 = walkForTypes(droppedComponents, ['scheduler']);
  const hasSidebar    = walkForTypes(droppedComponents, ['sidebar']);

  output += separator('CSS');

  output += `/* ── Buttons ── */\n`;
  output += `.btn-primary,\n.btn-secondary,\n.btn-tertiary {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  height: 34px;\n  padding: 5px 16px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  border: none;\n}\n\n`;
  output += `.btn-primary {\n  background-color: #5236ab;\n  color: #fff;\n}\n.btn-primary:hover {\n  background-color: #3a2679;\n}\n\n`;
  output += `.btn-secondary {\n  background-color: #fff;\n  color: #5236ab;\n  border: 1px solid #5236ab;\n}\n.btn-secondary:hover {\n  background-color: #f0edf9;\n}\n\n`;
  output += `.btn-tertiary {\n  background-color: transparent;\n  color: #5236ab;\n}\n.btn-tertiary:hover {\n  background-color: #f0edf9;\n}\n\n`;
  output += `.btn-icon-left {\n  margin-right: 8px;\n}\n.btn-icon-right {\n  margin-left: 8px;\n}\n.btn-col-wrapper {\n  padding-top: 4px;\n}\n`;

  if (hasSeg) {
    output += `\n/* ── Segmented buttons ── */\n`;
    output += `.segmented-buttons {\n  display: inline-flex;\n  align-items: center;\n}\n\n`;
    output += `.segmented-button {\n  background: #fff;\n  border: 1px solid #333;\n  padding: 5px 16px;\n  height: 34px;\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  cursor: pointer;\n  margin-right: -1px;\n  position: relative;\n}\n\n`;
    output += `.segmented-button-selected {\n  background: #e6e3f3;\n  z-index: 1;\n}\n\n`;
    output += `.segmented-button-icon {\n  font-size: 16px;\n  color: #333;\n}\n.segmented-button-check {\n  font-size: 16px;\n  color: #151515;\n}\n`;
  }

  if (hasText) {
    output += `\n/* ── Text components ── */\n`;
    output += `.text-component {\n  font-family: 'Lato', sans-serif;\n  color: #333;\n  margin: 0;\n}\n\n`;
    output += `.text-list {\n  padding-left: 20px;\n}\n\n`;
    output += `.text-link {\n  color: #5236ab;\n  text-decoration: underline;\n  cursor: pointer;\n}\n`;
  }

  if (hasCard) {
    output += `\n/* ── Card ── */\n`;
    output += `.card-standard {\n  background: #fff;\n  border: 1px solid #efefef;\n  box-shadow: 0px 2px 3px rgba(0,0,0,0.15);\n  width: 100%;\n}\n\n`;
    output += `.card-header-wrapper {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 16px 20px;\n  border-bottom: 1px solid #efefef;\n}\n\n`;
    output += `.card-title-standard {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 18px;\n  font-weight: 600;\n  color: #333;\n  margin: 0;\n}\n\n`;
    output += `.card-body-standard {\n  padding: 16px 20px;\n}\n`;
  }

  if (hasAccordion) {
    output += `\n/* ── Accordion ── */\n`;
    output += `.accordion-container {\n  background: #fff;\n  border: 1px solid #efefef;\n  box-shadow: 0px 2px 3px rgba(0,0,0,0.15);\n  width: 100%;\n}\n\n`;
    output += `.accordion-section {\n  border-bottom: 1px solid #efefef;\n}\n.accordion-section:last-child {\n  border-bottom: none;\n}\n\n`;
    output += `.accordion-title {\n  display: flex;\n  align-items: center;\n  padding: 16px 20px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 18px;\n  font-weight: 600;\n  color: #333;\n  cursor: pointer;\n  user-select: none;\n}\n\n`;
    output += `.accordion-content {\n  padding: 0 20px 16px;\n}\n`;
  }

  if (hasTabs) {
    output += `\n/* ── Tabs ── */\n`;
    output += `.tabs-container {\n  background: #fff;\n  border: 1px solid #efefef;\n  box-shadow: 0px 2px 3px rgba(0,0,0,0.15);\n  width: 100%;\n}\n\n`;
    output += `.tabs-header {\n  display: flex;\n  align-items: flex-end;\n  gap: 0;\n  padding: 0 20px;\n  background: #fff;\n}\n\n`;
    output += `.tab-title {\n  padding: 12px 16px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  color: #333;\n  background: none;\n  border: none;\n  cursor: pointer;\n  border-bottom: 3px solid transparent;\n  white-space: nowrap;\n}\n\n`;
    output += `.tab-title:hover {\n  color: #5236ab;\n}\n\n`;
    output += `.tab-title-active {\n  color: #5236ab;\n  border-bottom-color: #5236ab;\n}\n\n`;
    output += `.tabs-line {\n  height: 1px;\n  background: #efefef;\n  width: 100%;\n}\n\n`;
    output += `.tab-content-area {\n  padding: 16px 20px;\n}\n\n`;
    output += `.tab-dropped-children {\n  width: 100%;\n}\n`;
  }

  if (hasInput) {
    output += `\n/* ── Input fields (DevExtreme outlined) ── */\n`;
    output += `.pb-input-outlined .dx-texteditor.dx-editor-outlined {\n  border: 1px solid #a8a8a8;\n  box-shadow: none;\n  background-color: #fff;\n  height: 34px;\n  min-height: 34px;\n}\n\n`;
    output += `.pb-input-outlined .dx-texteditor.dx-editor-outlined.dx-state-focused {\n  border-color: #5236ab;\n  box-shadow: none;\n  outline: 1px solid #5236ab;\n  outline-offset: -1px;\n}\n\n`;
    output += `.pb-input-outlined .dx-texteditor-input {\n  height: 34px;\n  min-height: 34px;\n  padding: 4px 10px;\n}\n\n`;
    output += `.pb-input-outlined .dx-dropdowneditor-button {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 100%;\n}\n\n`;
    output += `.pb-input-outlined .dx-textarea.dx-editor-outlined {\n  height: auto;\n  min-height: 80px;\n}\n`;
  }

  if (hasAlert) {
    output += `\n/* ── Alerts ── */\n`;
    output += `.alert-base {\n  display: flex;\n  align-items: flex-start;\n  gap: 12px;\n  padding: 12px 16px;\n  border-radius: 0;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  width: 100%;\n}\n\n`;
    output += `.alert-info    { background: #e8f0fd; border-left: 4px solid #1a56db; color: #1e3a5f; }\n`;
    output += `.alert-success { background: #e3f8ee; border-left: 4px solid #0e9f6e; color: #1a4731; }\n`;
    output += `.alert-warning { background: #fef3c7; border-left: 4px solid #f59e0b; color: #78350f; }\n`;
    output += `.alert-error   { background: #fde8e8; border-left: 4px solid #e31937; color: #7b1d1d; }\n`;
  }

  if (hasChart) {
    output += `\n/* ── Charts ── */\n`;
    output += `.chart-card {\n  width: 100%;\n}\n\n`;
    output += `.chart-title {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-weight: 700;\n  font-size: 18px;\n  color: #333;\n  margin: 0 0 24px;\n  text-align: center;\n}\n\n`;
    output += `.chart-standard {\n  width: 100%;\n  height: 300px;\n}\n\n`;
    output += `.progress-chart-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 16px;\n}\n\n`;
    output += `.progress-chart-value {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-weight: 600;\n  font-size: 38px;\n  color: #333;\n  text-align: center;\n}\n\n`;
    output += `.progress-chart-label {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  color: #333;\n  text-align: center;\n}\n\n`;
    output += `.progress-bar-track {\n  background-color: #efefef;\n  border-radius: 20px;\n  height: 17px;\n  width: 100%;\n  overflow: hidden;\n}\n\n`;
    output += `.progress-bar-fill {\n  background-color: #5236ab;\n  height: 100%;\n  border-radius: 20px;\n  transition: width 0.3s ease;\n}\n\n`;
    output += `.gauge-chart-container {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n}\n\n`;
    output += `.gauge-donut {\n  position: relative;\n  width: 159px;\n  height: 100px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n`;
    output += `.gauge-svg {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: auto;\n}\n\n`;
    output += `.gauge-svg-foreground {\n  transform: rotate(180deg);\n  transform-origin: 50% 50%;\n}\n\n`;
    output += `.gauge-text {\n  position: absolute;\n  top: 50%;\n  left: 50%;\n  transform: translate(-50%, -50%);\n  font-family: 'Source Sans Pro', sans-serif;\n  font-weight: 600;\n  font-size: 38px;\n  color: #333;\n  text-align: center;\n  z-index: 10;\n}\n`;
  }

  if (hasDivider) {
    output += `\n/* ── Divider ── */\n`;
    output += `.divider {\n  width: 100%;\n  height: 0;\n  border: none;\n  border-top: 1px solid #d9d9d9;\n  margin: 0;\n  padding: 0;\n}\n`;
  }

  if (hasLabel) {
    output += `\n/* ── Labels ── */\n`;
    output += `.label {\n  display: inline-flex;\n  align-items: center;\n  padding: 2px 8px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 14px;\n  font-weight: 600;\n  border-radius: 2px;\n}\n\n`;
    output += `.label-default  { background: #f6f8f9; color: #333; border: 1px solid #efefef; }\n`;
    output += `.label-subtle   { background: #f6f8f9; color: #666; border: 1px solid #efefef; }\n`;
    output += `.label-info     { background: #e8f0fd; color: #1a56db; border: 1px solid #c3d6fa; }\n`;
    output += `.label-success  { background: #e3f8ee; color: #0e9f6e; border: 1px solid #a7f3d0; }\n`;
    output += `.label-warning  { background: #fef3c7; color: #d97706; border: 1px solid #fde68a; }\n`;
    output += `.label-error    { background: #fde8e8; color: #e31937; border: 1px solid #fca5a5; }\n`;
  }

  if (hasBadge) {
    output += `\n/* ── Badges ── */\n`;
    output += `.digit-badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  min-width: 20px;\n  height: 20px;\n  padding: 0 6px;\n  background: #e31937;\n  color: #fff;\n  border-radius: 10px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 12px;\n  font-weight: 700;\n}\n\n`;
    output += `.icon-badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 24px;\n  height: 24px;\n  border-radius: 50%;\n  background: #5236ab;\n  color: #fff;\n  font-size: 12px;\n}\n\n`;
    output += `.status-badge {\n  display: inline-flex;\n  align-items: center;\n  gap: 6px;\n  padding: 4px 10px;\n  border-radius: 12px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 13px;\n  font-weight: 600;\n  background: #e3f8ee;\n  color: #0e9f6e;\n}\n\n`;
    output += `.indicator-badge {\n  display: inline-block;\n  width: 10px;\n  height: 10px;\n  border-radius: 50%;\n  background: #5236ab;\n}\n`;
  }

  if (hasScheduler2) {
    output += `\n/* ── Scheduler ── */\n`;
    output += `/* DevExtreme Scheduler is self-contained — no extra CSS required. */\n`;
    output += `/* Optionally constrain the height via the height prop on <Scheduler>. */\n`;
  }

  if (hasSidebar) {
    output += `\n/* ── Navigation Sidebar ── */\n`;
    output += `.sidebar-content-layout {\n  display: flex;\n  width: 100%;\n  min-height: 400px;\n}\n\n`;
    output += `.sidebar-nav {\n  flex-shrink: 0;\n}\n\n`;
    output += `.sidebar-content-area {\n  flex: 1;\n  padding: 16px 20px;\n  border-left: 1px solid #efefef;\n  min-height: 400px;\n}\n\n`;
    output += `.nav-sidebar {\n  background: #fff;\n  border: 1px solid #efefef;\n  box-shadow: 0px 2px 3px rgba(0,0,0,0.15);\n  width: 240px;\n  min-width: 240px;\n}\n\n`;
    output += `.nav-sidebar-item {\n  background: #fff;\n  height: 64px;\n  border-bottom: 1px solid #efefef;\n  padding: 10px 16px;\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  transition: background-color 0.2s;\n  position: relative;\n}\n\n`;
    output += `.nav-sidebar-item:hover {\n  background: #f6f8f9;\n}\n\n`;
    output += `.nav-sidebar-item-expanded {\n  background: #f6f8f9;\n}\n\n`;
    output += `.nav-sidebar-item-actions {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n}\n\n`;
    output += `.nav-sidebar-item-text {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-weight: 600;\n  font-size: 18px;\n  color: #333;\n  flex: 1;\n}\n\n`;
    output += `.nav-sidebar-icon {\n  color: #5236ab;\n  font-size: 16px;\n}\n\n`;
    output += `.nav-sidebar-children {\n  background: #f6f8f9;\n}\n\n`;
    output += `.nav-sidebar-child-item {\n  background: #f6f8f9;\n  height: 48px;\n  padding: 10px 16px 10px 64px;\n  display: flex;\n  align-items: center;\n  cursor: pointer;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  color: #333;\n  transition: background-color 0.2s;\n  position: relative;\n}\n\n`;
    output += `.nav-sidebar-child-item:hover {\n  background: #e6e3f3;\n}\n\n`;
    output += `.nav-sidebar-child-item-selected {\n  background: #e6e3f3;\n  border-left: 4px solid #5236ab;\n}\n\n`;
    output += `.nav-sidebar-child-item:last-child {\n  border-bottom: 1px solid #efefef;\n}\n\n`;
    output += `.nav-sidebar-action-btn {\n  background: none;\n  border: none;\n  color: #5236ab;\n  cursor: pointer;\n  padding: 4px 8px;\n  font-size: 14px;\n  transition: color 0.2s;\n}\n\n`;
    output += `.nav-sidebar-action-btn:hover {\n  color: #3a2679;\n}\n\n`;
    output += `.nav-sidebar-add-main {\n  padding: 12px;\n  border-top: 1px solid #efefef;\n  display: flex;\n  justify-content: center;\n}\n\n`;
    output += `.nav-sidebar-add-main button {\n  background: #5236ab;\n  color: #fff;\n  border: none;\n  padding: 12px 16px;\n  cursor: pointer;\n  font-size: 16px;\n  font-weight: 600;\n  font-family: 'Source Sans Pro', sans-serif;\n  height: 48px;\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  justify-content: center;\n  white-space: nowrap;\n}\n\n`;
    output += `.nav-sidebar-add-main button:hover {\n  background: #6b4ac2;\n}\n`;
  }

  if (hasStepper) {
    output += `\n/* ── Stepper (horizontal) ── */\n`;
    output += `.stepper-horizontal {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n  width: 100%;\n  padding: 20px 75px;\n  box-sizing: border-box;\n}\n\n`;
    output += `.stepper-horizontal-step {\n  display: flex;\n  flex-direction: column;\n  gap: 6px;\n  flex: 1;\n  min-width: 0;\n  overflow: visible;\n}\n\n`;
    output += `.stepper-horizontal-step:last-child {\n  flex: 0 0 auto;\n  min-width: 63px;\n}\n\n`;
    output += `.stepper-horizontal-indicator {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  width: 100%;\n}\n\n`;
    output += `.stepper-horizontal-circle {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 32px;\n  height: 32px;\n  min-width: 32px;\n  border-radius: 50%;\n  border: 1px solid #a8a8a8;\n  background-color: #fff;\n  color: #333;\n  font-size: 14px;\n  font-family: 'Source Sans Pro', sans-serif;\n  font-weight: 600;\n}\n\n`;
    output += `.stepper-horizontal-circle-completed {\n  background-color: #5236ab;\n  border-color: #5236ab;\n  color: #fff;\n}\n\n`;
    output += `.stepper-horizontal-circle-active {\n  background-color: #fff;\n  border: 1px solid #5236ab;\n  color: #5236ab;\n}\n\n`;
    output += `.stepper-horizontal-line {\n  flex: 1;\n  height: 1px;\n  background-color: #a8a8a8;\n  min-width: 0;\n}\n\n`;
    output += `.stepper-horizontal-line-completed {\n  background-color: #5236ab;\n}\n\n`;
    output += `.stepper-horizontal-label {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  gap: 2px;\n}\n\n`;
    output += `.stepper-horizontal-label-completed {\n  color: #5236ab;\n}\n\n`;
    output += `.stepper-horizontal-title {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  line-height: normal;\n  word-break: break-word;\n}\n\n`;
    output += `.stepper-horizontal-description {\n  font-family: 'Lato', sans-serif;\n  font-size: 12px;\n  line-height: 14px;\n  margin-top: 2px;\n}\n\n`;
    output += `@media (max-width: 768px) {\n  .stepper-horizontal {\n    padding: 0 20px;\n    gap: 4px;\n  }\n  .stepper-horizontal-circle {\n    width: 24px;\n    height: 24px;\n    min-width: 24px;\n  }\n  .stepper-horizontal-title {\n    font-size: 13px;\n    text-align: center;\n    width: 100%;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    max-width: 80px;\n  }\n  .stepper-horizontal-label {\n    text-align: center;\n    max-width: 80px;\n    min-width: 60px;\n  }\n}\n`;
    output += `\n/* ── Stepper (vertical) ── */\n`;
    output += `.stepper-vertical {\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  gap: 0;\n}\n\n`;
    output += `.stepper-vertical-step {\n  display: flex;\n  gap: 16px;\n  width: 100%;\n  min-height: 49px;\n}\n\n`;
    output += `.stepper-vertical-indicator-wrapper {\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  flex-shrink: 0;\n}\n\n`;
    output += `.stepper-vertical-line {\n  flex: 1;\n  width: 1px;\n  background-color: #a8a8a8;\n  min-height: 24px;\n  margin-top: 4px;\n}\n\n`;
    output += `.stepper-vertical-line-completed {\n  background-color: #5236ab;\n}\n\n`;
    output += `.stepper-vertical-content {\n  flex: 1;\n  padding-top: 2px;\n  min-width: 0;\n}\n\n`;
    output += `.stepper-vertical-label {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  font-weight: 600;\n  line-height: normal;\n  color: #333;\n}\n\n`;
    output += `.stepper-vertical-active-content {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding-bottom: 32px;\n}\n\n`;
    output += `.stepper-vertical-description {\n  font-family: 'Source Sans Pro', sans-serif;\n  font-size: 16px;\n  line-height: 20px;\n  color: #333;\n}\n\n`;
    output += `.stepper-vertical-actions {\n  display: flex;\n  gap: 8px;\n  width: 100%;\n}\n`;
  }

  return output;
};
