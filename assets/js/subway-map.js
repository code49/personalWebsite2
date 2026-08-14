/**
 * Interactive Subway Network Map for Personal Website
 * Dynamically renders posts and tags as an interconnected subway map.
 */

(function() {
  const COLOR_PALETTE = {
    'fpga': '#bdb2ff',
    'cmu': '#a0c4ff',
    'projects': '#caffbf',
    'experience': '#ffadad',
    'rtl': '#daa9ff',
    'verilog': '#9bf6ff',
    'python': '#fdffb6',
    'teaching': '#ffd6a5',
    'verification': '#e7c6ff',
    'physical-design': '#b5ead7',
    'kicad': '#ffc6ff',
    'php': '#d0f4de',
    'javascript': '#fcf6bd',
    'nix': '#a3c4f3',
    'random': '#90e0ef',
    'bash': '#b9fbc0',
    'raspberry-pi': '#ffbf69'
  };

  function getTagColor(tag) {
    if (COLOR_PALETTE[tag]) return COLOR_PALETTE[tag];
    // Hash fallback for dynamic new tags
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 85%, 78%)`;
  }

  let mapData = null;
  let activeTagFilter = 'all';
  let activeSelectedStationId = null;

  function initSubwayMap() {
    const rawData = document.getElementById('subway-map-data');
    if (!rawData) return;
    try {
      mapData = JSON.parse(rawData.textContent);
    } catch (e) {
      console.error('Failed to parse subway map data', e);
      return;
    }

    renderLegendPills();
    setupCanvasAndNodes();

    // Check URL Hash (e.g. #fpga)
    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && mapData.tags.some(t => t.name.toLowerCase() === hash)) {
      filterTagLine(hash);
    }

    window.addEventListener('resize', debounce(setupCanvasAndNodes, 200));
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Window view switcher
  window.setSubwayView = function(mode) {
    const mapView = document.getElementById('subway-map-view');
    const listView = document.getElementById('subway-list-view');
    const legendBar = document.getElementById('subway-legend-container');
    const mapBtn = document.getElementById('toggle-map-btn');
    const listBtn = document.getElementById('toggle-list-btn');

    if (mode === 'map') {
      mapView.style.display = 'block';
      listView.style.display = 'none';
      legendBar.style.display = 'flex';
      mapBtn.classList.add('active');
      listBtn.classList.remove('active');
      setupCanvasAndNodes();
    } else {
      mapView.style.display = 'none';
      listView.style.display = 'block';
      legendBar.style.display = 'none';
      mapBtn.classList.remove('active');
      listBtn.classList.add('active');
    }
  };

  function renderLegendPills() {
    const legendWrap = document.getElementById('subway-legend-pills');
    if (!legendWrap) return;

    // Sort tags by post count descending
    const sortedTags = [...mapData.tags].sort((a, b) => b.count - a.count);

    let html = `
      <button class="legend-pill ${activeTagFilter === 'all' ? 'active-all' : ''}" onclick="filterTagLine('all')">
        <span class="pill-dot all-dot"></span> all lines (${mapData.posts.length})
      </button>
    `;

    sortedTags.forEach(tag => {
      const color = getTagColor(tag.name);
      const isActive = activeTagFilter === tag.name ? 'active' : '';
      html += `
        <button class="legend-pill ${isActive}" data-tag="${tag.name}" onclick="filterTagLine('${tag.name}')" style="--pill-color: ${color}">
          <span class="pill-dot" style="background-color: ${color}"></span> #${tag.name} (${tag.count})
        </button>
      `;
    });

    legendWrap.innerHTML = html;
  }

  window.filterTagLine = function(tagName) {
    activeTagFilter = tagName;
    renderLegendPills();
    drawNetworkMap();

    // Update location hash silently
    if (tagName !== 'all') {
      history.replaceState(null, null, `#${tagName}`);
    } else {
      history.replaceState(null, null, window.location.pathname);
    }
  };

  // Node placement geometry algorithm
  function computeStationLayout(posts, canvasWidth, canvasHeight) {
    const paddingX = 80;
    const paddingY = 80;
    const width = Math.max(canvasWidth, 760);

    // Group posts into 4 main grid routes for subway schematic feel
    const numPosts = posts.length;
    const cols = Math.min(4, Math.ceil(Math.sqrt(numPosts)));
    const rows = Math.ceil(numPosts / cols);

    const stepX = (width - 2 * paddingX) / Math.max(cols - 1, 1);
    const stepY = Math.max(140, (canvasHeight - 2 * paddingY) / Math.max(rows - 1, 1));

    const nodes = [];

    posts.forEach((post, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);

      // Add snake/zigzag stagger for organic subway grid routes
      const isOddRow = row % 2 === 1;
      const actualCol = isOddRow ? (cols - 1 - col) : col;

      const posX = paddingX + actualCol * stepX + (row % 2 === 1 ? 25 : -25);
      const posY = paddingY + row * stepY;

      nodes.push({
        post,
        x: posX,
        y: posY,
        tags: post.tags || []
      });
    });

    return nodes;
  }

  function setupCanvasAndNodes() {
    const container = document.querySelector('.subway-canvas-container');
    const canvas = document.getElementById('subway-canvas');
    const overlay = document.getElementById('subway-nodes-overlay');
    if (!container || !canvas || !overlay || !mapData) return;

    const width = container.clientWidth || 900;
    const height = Math.max(750, Math.ceil(mapData.posts.length / 3) * 160);

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';

    drawNetworkMap();
  }

  function drawNetworkMap() {
    const canvas = document.getElementById('subway-canvas');
    const overlay = document.getElementById('subway-nodes-overlay');
    if (!canvas || !overlay || !mapData) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const nodes = computeStationLayout(mapData.posts, width, height);

    // Build map of tag to list of station nodes
    const tagRoutes = {};
    mapData.tags.forEach(t => {
      tagRoutes[t.name] = [];
    });

    nodes.forEach(node => {
      node.tags.forEach(tag => {
        if (!tagRoutes[tag]) tagRoutes[tag] = [];
        tagRoutes[tag].push(node);
      });
    });

    // Draw track lines for each tag route
    Object.keys(tagRoutes).forEach((tag, tagIndex) => {
      const stationList = tagRoutes[tag];
      if (stationList.length < 1) return;

      const isFiltered = activeTagFilter === 'all' || activeTagFilter === tag;
      const lineColor = getTagColor(tag);

      ctx.beginPath();
      ctx.lineWidth = isFiltered ? 5 : 2;
      ctx.strokeStyle = isFiltered ? lineColor : 'rgba(100, 100, 100, 0.15)';
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (isFiltered && activeTagFilter === tag) {
        ctx.shadowColor = lineColor;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      // Draw octagonal subway lines connecting stations in this tag
      for (let i = 0; i < stationList.length - 1; i++) {
        const p1 = stationList[i];
        const p2 = stationList[i + 1];

        // Offset line parallel index for multi-track corridors
        const offset = (tagIndex % 5 - 2) * 4;

        const x1 = p1.x + offset;
        const y1 = p1.y + offset;
        const x2 = p2.x + offset;
        const y2 = p2.y + offset;

        const midX = (x1 + x2) / 2;

        ctx.moveTo(x1, y1);
        // 45 degree octagonal bend
        ctx.lineTo(midX, y1);
        ctx.lineTo(midX, y2);
        ctx.lineTo(x2, y2);
      }
      ctx.stroke();
    });

    ctx.restore();

    // Populate Overlay DOM Nodes
    overlay.innerHTML = '';
    nodes.forEach(node => {
      const isInterchange = node.tags.length > 1;
      const isFiltered = activeTagFilter === 'all' || node.tags.includes(activeTagFilter);

      const nodeEl = document.createElement('div');
      nodeEl.className = `subway-station-node ${isInterchange ? 'interchange-hub' : ''} ${isFiltered ? 'active-node' : 'dimmed-node'}`;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;

      // Set node background ring color
      const primaryColor = getTagColor(node.tags[0] || 'default');
      nodeEl.style.setProperty('--node-color', primaryColor);

      // Station Dot
      const dotEl = document.createElement('div');
      dotEl.className = 'node-dot-inner';
      if (isInterchange) {
        // Multi-color rings for interchange hub
        const ringsHtml = node.tags.map(t => `<span class="ring-segment" style="background-color: ${getTagColor(t)}"></span>`).join('');
        dotEl.innerHTML = `<div class="interchange-rings">${ringsHtml}</div>`;
      }
      nodeEl.appendChild(dotEl);

      // Station Title Tag Label
      const labelEl = document.createElement('div');
      labelEl.className = 'node-station-label';
      labelEl.innerHTML = `<span class="station-name-text">${escapeHtml(node.post.title)}</span><span class="station-date-sub">${node.post.date}</span>`;
      nodeEl.appendChild(labelEl);

      // Click event to open station ticket preview
      nodeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openStationTicket(node, nodeEl);
      });

      overlay.appendChild(nodeEl);
    });
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function openStationTicket(node, nodeEl) {
    activeSelectedStationId = node.post.id;
    const ticketCard = document.getElementById('station-ticket-card');
    if (!ticketCard) return;

    document.getElementById('ticket-title').textContent = node.post.title;
    document.getElementById('ticket-date').textContent = `${node.post.date} • ${node.post.categories[0] || 'article'}`;
    document.getElementById('ticket-excerpt').textContent = node.post.excerpt;
    document.getElementById('ticket-action-btn').href = node.post.url;

    // Render tag badges with line colors
    const tagsContainer = document.getElementById('ticket-tags-badges');
    tagsContainer.innerHTML = node.tags.map(t => `
      <span class="ticket-tag-badge" style="background-color: ${getTagColor(t)}; color: #1d1f21;">#${t}</span>
    `).join('');

    // Position ticket card near node
    const overlay = document.getElementById('subway-nodes-overlay');
    const overlayRect = overlay.getBoundingClientRect();

    let leftPos = node.x + 30;
    let topPos = node.y - 40;

    if (leftPos + 320 > overlayRect.width) {
      leftPos = node.x - 330;
    }
    if (topPos + 220 > overlayRect.height) {
      topPos = Math.max(20, node.y - 200);
    }

    ticketCard.style.left = `${Math.max(10, leftPos)}px`;
    ticketCard.style.top = `${Math.max(10, topPos)}px`;
    ticketCard.style.display = 'block';
  }

  window.closeStationTicket = function() {
    const ticketCard = document.getElementById('station-ticket-card');
    if (ticketCard) ticketCard.style.display = 'none';
    activeSelectedStationId = null;
  };

  // Close ticket on clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('#station-ticket-card') && !e.target.closest('.subway-station-node')) {
      closeStationTicket();
    }
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSubwayMap);
  } else {
    initSubwayMap();
  }
})();
