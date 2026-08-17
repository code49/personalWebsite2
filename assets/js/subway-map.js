/**
 * Interactive Hub & Spoke Radial Subway Network Map
 * Multi-Pass Iterative Relaxation Route Optimizer (Properly evaluates adjacent edge track overlaps without swallowing shared station node edges).
 */

(function() {
  const COLOR_PALETTE = {
    'hub': '#c4b5fd',
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
    if (!tag) return '#bdb2ff';
    const cleanTag = String(tag).toLowerCase().trim();
    if (COLOR_PALETTE[cleanTag]) return COLOR_PALETTE[cleanTag];
    let hash = 0;
    for (let i = 0; i < cleanTag.length; i++) {
      hash = cleanTag.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 85%, 78%)`;
  }

  function normalizeTags(tags) {
    if (Array.isArray(tags)) return tags.map(t => String(t).trim()).filter(Boolean);
    if (typeof tags === 'string') return tags.split(/\s+/).map(t => t.trim()).filter(Boolean);
    return [];
  }

  function formatSubwayDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const yy = String(d.getFullYear()).slice(-2);
    return `${mm}.${dd}.${yy}`;
  }

  function getStationCardHeight(title, tags) {
    const cleanTitle = String(title || '').trim();
    const words = cleanTitle.split(/\s+/);
    let lines = 1;
    let lineLen = 0;
    words.forEach(w => {
      if (lineLen + w.length > 15) {
        lines++;
        lineLen = w.length;
      } else {
        lineLen += (lineLen === 0 ? 0 : 1) + w.length;
      }
    });
    lines = Math.max(1, Math.min(4, lines));
    const metaHeight = 18;
    const titleHeight = lines * 16;
    const padding = 10;
    return metaHeight + titleHeight + padding;
  }

  function intersectsSegmentBox(x1, y1, x2, y2, bx1, by1, bx2, by2) {
    if (Math.max(x1, x2) < bx1 || Math.min(x1, x2) > bx2) return false;
    if (Math.max(y1, y2) < by1 || Math.min(y1, y2) > by2) return false;

    const A = y2 - y1;
    const B = x1 - x2;
    const C = x2 * y1 - x1 * y2;

    const v1 = A * bx1 + B * by1 + C;
    const v2 = A * bx2 + B * by1 + C;
    const v3 = A * bx1 + B * by2 + C;
    const v4 = A * bx2 + B * by2 + C;

    if (v1 > 0 && v2 > 0 && v3 > 0 && v4 > 0) return false;
    if (v1 < 0 && v2 < 0 && v3 < 0 && v4 < 0) return false;
    return true;
  }

  function segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
    const ccw = (ax, ay, bx, by, cx, cy) => {
      return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
    };
    return (ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4)) &&
           (ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4));
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

    if (!mapData || !mapData.posts) return;

    mapData.posts.forEach(p => {
      p.tags = normalizeTags(p.tags);
    });

    if (!mapData.tags.some(t => t.name === 'hub')) {
      mapData.tags.push({ name: 'hub', count: PENTAGON_HUBS.length });
    }

    renderLegendPills();
    setupCanvasAndNodes();

    const hash = window.location.hash.replace('#', '').toLowerCase();
    if (hash && mapData.tags.some(t => String(t.name).toLowerCase() === hash)) {
      filterTagLine(hash);
    }

    window.addEventListener('resize', debounce(setupCanvasAndNodes, 150));
    window.addEventListener('load', setupCanvasAndNodes);
    requestAnimationFrame(setupCanvasAndNodes);
  }

  function debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

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
      if (mapBtn) mapBtn.classList.add('active');
      if (listBtn) listBtn.classList.remove('active');
      requestAnimationFrame(setupCanvasAndNodes);
    } else {
      mapView.style.display = 'none';
      listView.style.display = 'block';
      legendBar.style.display = 'none';
      if (mapBtn) mapBtn.classList.remove('active');
      if (listBtn) listBtn.classList.add('active');
    }
  };

  function renderLegendPills() {
    const legendWrap = document.getElementById('subway-legend-pills');
    if (!legendWrap || !mapData) return;

    const sortedTags = [...mapData.tags].sort((a, b) => b.count - a.count);

    let html = `
      <button class="legend-pill ${activeTagFilter === 'all' ? 'active-all' : ''}" onclick="filterTagLine('all')">
        <span class="pill-dot all-dot"></span> all lines (${mapData.posts.length})
      </button>
    `;

    sortedTags.forEach(tag => {
      const tagName = String(tag.name);
      const color = getTagColor(tagName);
      const isActive = activeTagFilter === tagName ? 'active' : '';
      html += `
        <button class="legend-pill ${isActive}" data-tag="${escapeHtml(tagName)}" onclick="filterTagLine('${escapeHtml(tagName)}')" style="--pill-color: ${color}">
          <span class="pill-dot" style="background-color: ${color}"></span> #${escapeHtml(tagName)} (${tag.count})
        </button>
      `;
    });

    legendWrap.innerHTML = html;
  }

  window.filterTagLine = function(tagName) {
    activeTagFilter = tagName;
    renderLegendPills();
    drawNetworkMap();

    if (tagName !== 'all') {
      history.replaceState(null, null, `#${tagName}`);
    } else {
      history.replaceState(null, null, window.location.pathname);
    }
  };

  // 5 Central Core Hub Stations forming Pentagon Loop
  const PENTAGON_HUBS = [
    { matcher: p => p.url.includes('/projects/hydra.html') || p.title === 'hydra' },                  // 0: VLSI Hub
    { matcher: p => p.url.includes('/education/cmu.html') || p.title === 'carnegie mellon university' }, // 1: CMU Hub
    { matcher: p => p.url.includes('/teaching/18100.html') || p.title.includes('18-100') },             // 2: Teaching Hub
    { matcher: p => p.url.includes('/experience/kla.html') || p.title === 'kla' },                       // 3: Experience Hub
    { matcher: p => p.url.includes('dotfiles.html') || p.title === 'dotfiles' }                          // 4: Software / Tools Hub (dotfiles)
  ];

  // Dynamic Radial Spoke Branches based on Tag & Category Rules
  const THEMATIC_BRANCHES = [
    // Hub 0 (hydra / VLSI): Sub-line 0A - FPGA Line
    {
      name: 'VLSI - FPGA Line',
      hubIndex: 0,
      angle: -Math.PI * 0.82,
      filter: p => (p.tags || []).includes('fpga')
    },
    // Hub 0 (hydra / VLSI): Sub-line 0B - ASIC & Physical Design Line
    {
      name: 'VLSI - ASIC Line',
      hubIndex: 0,
      angle: -Math.PI * 0.42,
      filter: p => ((p.tags || []).includes('rtl') || (p.tags || []).includes('verilog') || (p.tags || []).includes('physical-design')) && !(p.tags || []).includes('fpga')
    },
    // Hub 1 (carnegie mellon university / CMU Coursework Line)
    {
      name: 'CMU Coursework',
      hubIndex: 1,
      angle: -Math.PI * 0.15,
      filter: p => (p.categories || []).includes('education') || ((p.tags || []).includes('cmu') && !(p.tags || []).includes('projects') && !(p.tags || []).includes('teaching'))
    },
    // Hub 2 (18-100 / Teaching Line)
    {
      name: 'Teaching',
      hubIndex: 2,
      angle: Math.PI * 0.35,
      filter: p => (p.tags || []).includes('teaching') || (p.categories || []).includes('teaching')
    },
    // Hub 3 (kla / Experience Line)
    {
      name: 'Experience',
      hubIndex: 3,
      angle: Math.PI * 0.75,
      filter: p => (p.tags || []).includes('experience') || (p.categories || []).includes('experience')
    },
    // Hub 4 (dotfiles / Software & Tools Line)
    {
      name: 'Software & Tools',
      hubIndex: 4,
      angle: -Math.PI * 0.95,
      filter: p => (p.tags || []).includes('nix') || (p.tags || []).includes('bash') || (p.tags || []).includes('raspberry-pi') || (p.categories || []).includes('software')
    }
  ];

  function getPermutations(arr) {
    if (arr.length <= 1) return [arr];
    const result = [];
    for (let i = 0; i < arr.length; i++) {
      const current = arr[i];
      const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
      const remainingPerms = getPermutations(remaining);
      for (let j = 0; j < remainingPerms.length; j++) {
        result.push([current].concat(remainingPerms[j]));
      }
    }
    return result;
  }

  function findLeastCrowdedDirection(currX, currY, baseAngle, placedNodes, canvasWidth, canvasHeight) {
    const numRays = 16;
    const probeDist = 130;
    const minX = 90;
    const maxX = canvasWidth - 90;
    const minY = 60;
    const maxY = canvasHeight - 60;

    let bestAngle = baseAngle;
    let minScore = Infinity;

    for (let i = 0; i < numRays; i++) {
      const candAngle = baseAngle + (i - numRays / 2) * (Math.PI / 8);
      const probeX = currX + probeDist * Math.cos(candAngle);
      const probeY = currY + probeDist * Math.sin(candAngle);

      let boundaryPenalty = 0;
      if (probeX < minX || probeX > maxX || probeY < minY || probeY > maxY) {
        boundaryPenalty = 10000;
      }

      let densityPenalty = 0;
      placedNodes.forEach(n => {
        const dx = probeX - n.x;
        const dy = probeY - n.y;
        const distSq = dx * dx + dy * dy;
        densityPenalty += 50000 / (distSq + 400);
      });

      const angleDiff = Math.abs(candAngle - baseAngle);
      const anglePenalty = angleDiff * 80;

      const totalScore = boundaryPenalty + densityPenalty + anglePenalty;
      if (totalScore < minScore) {
        minScore = totalScore;
        bestAngle = candAngle;
      }
    }

    return bestAngle;
  }

  function evaluateHubPermutation(hubOrder, posts, canvasWidth, canvasHeight) {
    const xc = canvasWidth / 2;
    const yc = canvasHeight / 2;
    const minDim = Math.min(canvasWidth, canvasHeight);
    const ringRadius = Math.min(130, Math.max(90, minDim * 0.14));

    const nodes = [];
    const placedPostUrls = new Set();
    const hubPositions = {};
    const trackSegments = [];

    hubOrder.forEach((hubIdx, posIdx) => {
      const hubConfig = PENTAGON_HUBS[hubIdx];
      const post = posts.find(p => hubConfig.matcher(p));
      const angle = (posIdx / 5) * 2 * Math.PI - Math.PI / 2;
      const x = xc + ringRadius * Math.cos(angle);
      const y = yc + ringRadius * Math.sin(angle);

      hubPositions[hubIdx] = { x, y, angle };

      if (post) {
        placedPostUrls.add(post.url);
        const cardH = getStationCardHeight(post.title, post.tags);
        nodes.push({ post, x, y, w: 130, h: cardH, tags: post.tags || [], isRing: true, hubIndex: hubIdx, branchIndex: -1 });
      }
    });

    const minX = Math.min(95, canvasWidth * 0.11);
    const maxX = canvasWidth - minX;
    const minY = Math.min(65, canvasHeight * 0.08);
    const maxY = canvasHeight - minY;

    THEMATIC_BRANCHES.forEach((branch, bIdx) => {
      const hubPos = hubPositions[branch.hubIndex] || { x: xc, y: yc, angle: branch.angle };
      let lastNode = nodes.find(n => n.isRing && n.hubIndex === branch.hubIndex);

      let currX = hubPos.x;
      let currY = hubPos.y;

      const branchPosts = posts.filter(p => !placedPostUrls.has(p.url) && branch.filter(p));

      // Dynamic Tag Similarity Chain Ordering: Sort stations from highest tag similarity to lowest
      const orderedBranchPosts = [];
      let currentRefTags = lastNode ? (lastNode.tags || []) : [];

      while (branchPosts.length > 0) {
        let bestIdx = 0;
        let bestScore = -1;

        branchPosts.forEach((post, pIdx) => {
          const pTags = post.tags || [];
          const sharedCount = pTags.filter(t => currentRefTags.includes(t)).length;
          const score = sharedCount * 100 + pTags.length;

          if (score > bestScore) {
            bestScore = score;
            bestIdx = pIdx;
          }
        });

        const nextPost = branchPosts.splice(bestIdx, 1)[0];
        orderedBranchPosts.push(nextPost);
        currentRefTags = nextPost.tags || [];
      }

      orderedBranchPosts.forEach(post => {
        placedPostUrls.add(post.url);

        const cardH = getStationCardHeight(post.title, post.tags);
        const cardW = 130;

        const steerAngle = findLeastCrowdedDirection(currX, currY, hubPos.angle, nodes, canvasWidth, canvasHeight);
        const dirX = Math.cos(steerAngle);
        const dirY = Math.sin(steerAngle);

        const prevH = lastNode ? lastNode.h : 44;
        const minStepY = (prevH / 2 + cardH / 2) + 22;
        const minStepX = 140;

        let stepDist = (Math.abs(dirY) > Math.abs(dirX)) ? Math.max(85, minStepY) : minStepX;
        let candX = currX + dirX * stepDist;
        let candY = currY + dirY * stepDist;

        candX = Math.max(minX, Math.min(maxX, candX));
        candY = Math.max(minY, Math.min(maxY, candY));

        const newNode = { post, x: candX, y: candY, w: cardW, h: cardH, tags: post.tags || [], isRing: false, branchIndex: bIdx };

        if (lastNode) {
          trackSegments.push({ x1: lastNode.x, y1: lastNode.y, x2: candX, y2: candY, tags: post.tags || [] });
        }

        currX = candX;
        currY = candY;
        lastNode = newNode;
        nodes.push(newNode);
      });
    });

    // Dynamic Catch-All Fallback for unclassified posts ordered by tag similarity
    const unplacedPosts = posts.filter(p => !placedPostUrls.has(p.url));
    if (unplacedPosts.length > 0) {
      while (unplacedPosts.length > 0) {
        let bestPostIdx = 0;
        let bestBIdx = 0;
        let maxOverlap = -1;

        unplacedPosts.forEach((post, pIdx) => {
          THEMATIC_BRANCHES.forEach((b, bIdx) => {
            const bNodes = nodes.filter(n => n.branchIndex === bIdx);
            const lastBNode = bNodes.length > 0 ? bNodes[bNodes.length - 1] : nodes[0];
            const overlap = (post.tags || []).filter(t => (lastBNode.tags || []).includes(t)).length;
            if (overlap > maxOverlap) {
              maxOverlap = overlap;
              bestBIdx = bIdx;
              bestPostIdx = pIdx;
            }
          });
        });

        const post = unplacedPosts.splice(bestPostIdx, 1)[0];
        placedPostUrls.add(post.url);

        const bNodes = nodes.filter(n => n.branchIndex === bestBIdx);
        const lastNode = bNodes.length > 0 ? bNodes[bNodes.length - 1] : nodes[0];
        const hubPos = hubPositions[THEMATIC_BRANCHES[bestBIdx].hubIndex] || { x: xc, y: yc, angle: THEMATIC_BRANCHES[bestBIdx].angle };

        const cardH = getStationCardHeight(post.title, post.tags);
        const cardW = 130;
        const steerAngle = findLeastCrowdedDirection(lastNode.x, lastNode.y, hubPos.angle, nodes, canvasWidth, canvasHeight);
        const dirX = Math.cos(steerAngle);
        const dirY = Math.sin(steerAngle);

        let candX = Math.max(minX, Math.min(maxX, lastNode.x + dirX * 140));
        let candY = Math.max(minY, Math.min(maxY, lastNode.y + dirY * 85));

        const newNode = { post, x: candX, y: candY, w: cardW, h: cardH, tags: post.tags || [], isRing: false, branchIndex: bestBIdx };
        trackSegments.push({ x1: lastNode.x, y1: lastNode.y, x2: candX, y2: candY, tags: post.tags || [] });
        nodes.push(newNode);
      }
    }

    let crossings = 0;
    for (let i = 0; i < trackSegments.length; i++) {
      for (let j = i + 1; j < trackSegments.length; j++) {
        const s1 = trackSegments[i];
        const s2 = trackSegments[j];
        if (s1.tags.some(t => s2.tags.includes(t))) continue;
        if (segmentsIntersect(s1.x1, s1.y1, s1.x2, s1.y2, s2.x1, s2.y1, s2.x2, s2.y2)) {
          crossings++;
        }
      }
    }

    return { nodes, crossings };
  }

  function computeStationLayout(posts, canvasWidth, canvasHeight) {
    const permutations = getPermutations([0, 1, 2, 3, 4]);
    let bestResult = null;
    let minCrossings = Infinity;

    permutations.forEach(perm => {
      const evalRes = evaluateHubPermutation(perm, posts, canvasWidth, canvasHeight);
      if (evalRes.crossings < minCrossings) {
        minCrossings = evalRes.crossings;
        bestResult = evalRes;
      }
    });

    const nodes = bestResult ? bestResult.nodes : evaluateHubPermutation([0, 1, 2, 3, 4], posts, canvasWidth, canvasHeight).nodes;

    for (let iter = 0; iter < 25; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];

          const dx = n2.x - n1.x;
          const dy = n2.y - n1.y;
          const absDX = Math.abs(dx);
          const absDY = Math.abs(dy);

          const minDX = (n1.w / 2 + n2.w / 2) + 16;
          const minDY = (n1.h / 2 + n2.h / 2) + 12;

          if (absDX < minDX && absDY < minDY) {
            const overlapX = minDX - absDX;
            const overlapY = minDY - absDY;

            if (overlapX < overlapY) {
              const pushX = (overlapX / 2) * (dx >= 0 ? 1 : -1);
              if (!n1.isRing) n1.x -= pushX;
              if (!n2.isRing) n2.x += pushX;
            } else {
              const pushY = (overlapY / 2) * (dy >= 0 ? 1 : -1);
              if (!n1.isRing) n1.y -= pushY;
              if (!n2.isRing) n2.y += pushY;
            }
          }
        }
      }
    }

    const snapThreshold = 16;
    THEMATIC_BRANCHES.forEach((branch, bIdx) => {
      const hubNode = nodes.find(n => n.isRing && n.hubIndex === branch.hubIndex);
      const branchNodes = nodes.filter(n => n.branchIndex === bIdx);
      const chain = hubNode ? [hubNode, ...branchNodes] : branchNodes;

      for (let i = 0; i < chain.length - 1; i++) {
        const n1 = chain[i];
        const n2 = chain[i + 1];
        if (!n2.isRing) {
          if (Math.abs(n2.y - n1.y) < snapThreshold) {
            n2.y = n1.y;
          } else if (Math.abs(n2.x - n1.x) < snapThreshold) {
            n2.x = n1.x;
          }
        }
      }
    });

    const paddingX = 75;
    const paddingY = 40;
    nodes.forEach(n => {
      n.x = Math.max(paddingX, Math.min(canvasWidth - paddingX, n.x));
      n.y = Math.max(paddingY, Math.min(canvasHeight - paddingY, n.y));
    });

    return nodes;
  }

  function setupCanvasAndNodes() {
    const container = document.querySelector('.subway-canvas-container');
    const canvas = document.getElementById('subway-canvas');
    const overlay = document.getElementById('subway-nodes-overlay');
    if (!container || !canvas || !overlay || !mapData) return;

    const width = container.clientWidth || 900;
    const height = 800;

    if (width < 650) {
      setSubwayView('list');
      return;
    }

    canvas.width = width * window.devicePixelRatio;
    canvas.height = height * window.devicePixelRatio;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    overlay.style.width = width + 'px';
    overlay.style.height = height + 'px';

    drawNetworkMap();
  }

  function getRouteWaypoints(p1, p2, mode) {
    const segDX = p2.x - p1.x;
    const segDY = p2.y - p1.y;
    const minD = Math.min(Math.abs(segDX), Math.abs(segDY));

    if (mode === 'DIRECT' || mode === 'H' || mode === 'V' || mode === 'D') {
      return [{ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y }];
    } else if (mode === 'HV') {
      const midX = p1.x + Math.sign(segDX) * (Math.abs(segDX) - minD);
      return [{ x: p1.x, y: p1.y }, { x: midX, y: p1.y }, { x: p2.x, y: p2.y }];
    } else if (mode === 'VH') {
      const midY = p1.y + Math.sign(segDY) * (Math.abs(segDY) - minD);
      return [{ x: p1.x, y: p1.y }, { x: p1.x, y: midY }, { x: p2.x, y: p2.y }];
    }
    return [{ x: p1.x, y: p1.y }, { x: p2.x, y: p2.y }];
  }

  function getHeadingKey(w0, w1) {
    const dx = w1.x - w0.x;
    const dy = w1.y - w0.y;
    if (Math.abs(dy) < 5) {
      return `H_${dx >= 0 ? '+' : '-'}`;
    } else if (Math.abs(dx) < 5) {
      return `V_${dy >= 0 ? '+' : '-'}`;
    } else {
      return `D_${dx >= 0 ? '+' : '-'}_${dy >= 0 ? '+' : '-'}`;
    }
  }

  function getCandidateModes(p1, p2) {
    return ['DIRECT', 'HV', 'VH'];
  }

  function calculatePathInterferenceCost(candMode, corridor, allNodes, edgeCorridors, currentEdgeKey) {
    let cost = 0;

    // Prefer direct straight tracks; penalize extra octagonal elbow turns unless needed to avoid collisions
    if (candMode === 'HV' || candMode === 'VH') {
      cost += 300;
    }

    const waypoints = getRouteWaypoints(corridor.p1, corridor.p2, candMode);

    // 1. Station Card Bounding Box Collision Penalty
    for (let i = 0; i < waypoints.length - 1; i++) {
      const segStart = waypoints[i];
      const segEnd = waypoints[i + 1];

      allNodes.forEach(n => {
        if (n === corridor.p1 || n === corridor.p2) return;
        const bx1 = n.x - n.w / 2 - 10;
        const bx2 = n.x + n.w / 2 + 10;
        const by1 = n.y - n.h / 2 - 10;
        const by2 = n.y + n.h / 2 + 10;

        if (intersectsSegmentBox(segStart.x, segStart.y, segEnd.x, segEnd.y, bx1, by1, bx2, by2)) {
          cost += 5000;
        }
      });
    }

    if (!edgeCorridors) return cost;

    // Candidate departure & arrival headings for current corridor
    const candDepartureHeading = getHeadingKey(waypoints[0], waypoints[1]);
    const candArrivalHeading = getHeadingKey(waypoints[waypoints.length - 1], waypoints[waypoints.length - 2]);

    // 2. Departure / Arrival Heading Conflict Penalty at Shared Nodes
    Object.keys(edgeCorridors).forEach(key => {
      if (key === currentEdgeKey) return;
      const oth = edgeCorridors[key];
      const othMode = oth.preferredHVChoice || 'HV';
      const othWaypoints = getRouteWaypoints(oth.p1, oth.p2, othMode);

      // Check node p1 departure conflict
      if (oth.p1 === corridor.p1) {
        const othHeading = getHeadingKey(othWaypoints[0], othWaypoints[1]);
        if (candDepartureHeading === othHeading) {
          cost += 15000; // Heavy penalty for departing shared node in exact same direction/axis
        }
      } else if (oth.p2 === corridor.p1) {
        const othHeading = getHeadingKey(othWaypoints[othWaypoints.length - 1], othWaypoints[othWaypoints.length - 2]);
        if (candDepartureHeading === othHeading) {
          cost += 12000;
        }
      }

      // Check node p2 arrival conflict
      if (oth.p2 === corridor.p2) {
        const othHeading = getHeadingKey(othWaypoints[othWaypoints.length - 1], othWaypoints[othWaypoints.length - 2]);
        if (candArrivalHeading === othHeading) {
          cost += 15000;
        }
      } else if (oth.p1 === corridor.p2) {
        const othHeading = getHeadingKey(othWaypoints[0], othWaypoints[1]);
        if (candArrivalHeading === othHeading) {
          cost += 12000;
        }
      }

      // 3. Polyline Track Overlap Penalty against other non-incident corridors
      for (let i = 0; i < waypoints.length - 1; i++) {
        const s1A = waypoints[i];
        const s1B = waypoints[i + 1];

        for (let j = 0; j < othWaypoints.length - 1; j++) {
          const s2A = othWaypoints[j];
          const s2B = othWaypoints[j + 1];

          // Check if horizontal sub-segments overlap closely
          const isH1 = Math.abs(s1A.y - s1B.y) < 5;
          const isH2 = Math.abs(s2A.y - s2B.y) < 5;
          if (isH1 && isH2 && Math.abs(s1A.y - s2A.y) < 20) {
            const minX1 = Math.min(s1A.x, s1B.x), maxX1 = Math.max(s1A.x, s1B.x);
            const minX2 = Math.min(s2A.x, s2B.x), maxX2 = Math.max(s2A.x, s2B.x);
            if (maxX1 > minX2 + 15 && minX1 < maxX2 - 15) {
              cost += 8000;
            }
          }

          // Check if vertical sub-segments overlap closely
          const isV1 = Math.abs(s1A.x - s1B.x) < 5;
          const isV2 = Math.abs(s2A.x - s2B.x) < 5;
          if (isV1 && isV2 && Math.abs(s1A.x - s2A.x) < 20) {
            const minY1 = Math.min(s1A.y, s1B.y), maxY1 = Math.max(s1A.y, s1B.y);
            const minY2 = Math.min(s2A.y, s2B.y), maxY2 = Math.max(s2A.y, s2B.y);
            if (maxY1 > minY2 + 15 && minY1 < maxY2 - 15) {
              cost += 8000;
            }
          }
        }
      }
    });

    return cost;
  }

  function drawBundledOctagonalTrack(ctx, p1, p2, parallelOffset, routeMode) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;

    const nx = -dy / len;
    const ny = dx / len;

    const offP1 = { x: p1.x + nx * parallelOffset, y: p1.y + ny * parallelOffset };
    const offP2 = { x: p2.x + nx * parallelOffset, y: p2.y + ny * parallelOffset };

    const waypoints = getRouteWaypoints(offP1, offP2, routeMode);

    ctx.moveTo(waypoints[0].x, waypoints[0].y);
    for (let i = 1; i < waypoints.length; i++) {
      ctx.lineTo(waypoints[i].x, waypoints[i].y);
    }
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

    // Global Consistent Tag Slot Map
    const globalTagSlotMap = {};
    const sortedAllTags = [...mapData.tags].sort((a, b) => b.count - a.count || String(a.name).localeCompare(String(b.name)));
    sortedAllTags.forEach((tObj, idx) => {
      globalTagSlotMap[tObj.name] = idx;
    });

    // Central Interchange Hub Ring Nodes
    const ringNodes = [];
    nodes.filter(n => n.isRing).forEach(node => {
      if (!node.tags.includes('hub')) node.tags.push('hub');
      ringNodes.push(node);
    });

    // UNIFIED TOPOLOGICAL EDGE CORRIDOR BUNDLING ENGINE
    const edgeCorridors = {};

    function addEdgeTag(n1, n2, tag) {
      const id1 = n1.post.id;
      const id2 = n2.post.id;
      const edgeKey = id1 < id2 ? `${id1}___${id2}` : `${id2}___${id1}`;
      if (!edgeCorridors[edgeKey]) {
        edgeCorridors[edgeKey] = { p1: n1, p2: n2, tags: [], preferredHVChoice: 'HV' };
      }
      if (!edgeCorridors[edgeKey].tags.includes(tag)) {
        edgeCorridors[edgeKey].tags.push(tag);
      }
    }

    // 1. Central Interchange Hub Loop Connections with shadow 'hub' line
    for (let i = 0; i < ringNodes.length; i++) {
      const h1 = ringNodes[i];
      const h2 = ringNodes[(i + 1) % ringNodes.length];

      // Add shadow 'hub' line tag
      addEdgeTag(h1, h2, 'hub');

      mapData.tags.forEach(tObj => {
        const tag = tObj.name;
        if (tag !== 'hub' && h1.tags.includes(tag) && h2.tags.includes(tag)) {
          addEdgeTag(h1, h2, tag);
        }
      });
    }

    // 2. Physical Spoke Branch Station Chains
    THEMATIC_BRANCHES.forEach((branch, bIdx) => {
      const hubNode = nodes.find(n => n.isRing && n.hubIndex === branch.hubIndex);
      const branchNodes = nodes.filter(n => n.branchIndex === bIdx);

      let chain = [];
      if (hubNode) chain.push(hubNode);
      chain = chain.concat(branchNodes);

      for (let i = 0; i < chain.length - 1; i++) {
        const s1 = chain[i];
        const s2 = chain[i + 1];

        mapData.tags.forEach(tObj => {
          const tag = tObj.name;
          const s1Has = s1.tags.includes(tag);
          const s2Has = s2.tags.includes(tag);

          const downstreamHas = chain.slice(i + 1).some(st => st.tags.includes(tag));
          const upstreamHas = chain.slice(0, i + 1).some(st => st.tags.includes(tag));

          if ((s1Has && s2Has) || (upstreamHas && downstreamHas)) {
            addEdgeTag(s1, s2, tag);
          }
        });
      }
    });

    const corridorKeys = Object.keys(edgeCorridors);

    // Initial Pass: Assign initial best candidate mode for each edge corridor
    corridorKeys.forEach(edgeKey => {
      const corridor = edgeCorridors[edgeKey];
      const candidateModes = getCandidateModes(corridor.p1, corridor.p2);
      let bestMode = candidateModes[0];
      let minCost = Infinity;

      candidateModes.forEach(candMode => {
        const cost = calculatePathInterferenceCost(candMode, corridor, nodes, edgeCorridors, edgeKey);
        if (cost < minCost) {
          minCost = cost;
          bestMode = candMode;
        }
      });

      corridor.preferredHVChoice = bestMode;
    });

    // Multi-Pass Universal Relaxation Loop: Evaluates adjacent edge track overlaps & departure heading conflicts
    for (let pass = 0; pass < 5; pass++) {
      let flips = 0;
      corridorKeys.forEach(edgeKey => {
        const corridor = edgeCorridors[edgeKey];
        const candidateModes = getCandidateModes(corridor.p1, corridor.p2);
        let bestMode = corridor.preferredHVChoice;
        let minCost = Infinity;

        candidateModes.forEach(candMode => {
          const cost = calculatePathInterferenceCost(candMode, corridor, nodes, edgeCorridors, edgeKey);
          if (cost < minCost) {
            minCost = cost;
            bestMode = candMode;
          }
        });

        if (bestMode !== corridor.preferredHVChoice) {
          corridor.preferredHVChoice = bestMode;
          flips++;
        }
      });
      if (flips === 0) break;
    }

    const trackSpacing = 5;

    // Render each edge corridor with globally optimized, retroactively relaxed HV/VH route choices!
    corridorKeys.forEach(edgeKey => {
      const corridor = edgeCorridors[edgeKey];
      const sharedTags = [...corridor.tags].sort((a, b) => (globalTagSlotMap[a] || 0) - (globalTagSlotMap[b] || 0));
      const bundleCount = sharedTags.length;

      sharedTags.forEach((tag, idx) => {
        const isFiltered = activeTagFilter === 'all' || activeTagFilter === tag;
        const lineColor = getTagColor(tag);

        ctx.beginPath();
        ctx.lineWidth = isFiltered ? (activeTagFilter === tag ? 5 : 4) : 2;
        ctx.strokeStyle = isFiltered ? lineColor : 'rgba(120, 120, 120, 0.15)';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        if (isFiltered && activeTagFilter === tag) {
          ctx.shadowColor = lineColor;
          ctx.shadowBlur = 12;
        } else {
          ctx.shadowBlur = 0;
        }

        const parallelOffset = (idx - (bundleCount - 1) / 2) * trackSpacing;

        drawBundledOctagonalTrack(ctx, corridor.p1, corridor.p2, parallelOffset, corridor.preferredHVChoice);
        ctx.stroke();
      });
    });

    // Single-Tag Active Mode: Draw Straight Line Bridge Connectors between line segment endpoints beneath stations
    if (activeTagFilter !== 'all') {
      const activeTagColor = getTagColor(activeTagFilter);
      ctx.lineWidth = 5;
      ctx.strokeStyle = activeTagColor;
      ctx.shadowColor = activeTagColor;
      ctx.shadowBlur = 12;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      nodes.forEach(node => {
        const incidentCorridors = corridorKeys.map(k => edgeCorridors[k]).filter(c => {
          return c.tags.includes(activeTagFilter) && (c.p1 === node || c.p2 === node);
        });

        if (incidentCorridors.length === 2) {
          const c1 = incidentCorridors[0];
          const c2 = incidentCorridors[1];

          const c1Tags = [...c1.tags].sort((a, b) => (globalTagSlotMap[a] || 0) - (globalTagSlotMap[b] || 0));
          const c1Idx = c1Tags.indexOf(activeTagFilter);
          const c1Off = (c1Idx - (c1Tags.length - 1) / 2) * trackSpacing;

          const c2Tags = [...c2.tags].sort((a, b) => (globalTagSlotMap[a] || 0) - (globalTagSlotMap[b] || 0));
          const c2Idx = c2Tags.indexOf(activeTagFilter);
          const c2Off = (c2Idx - (c2Tags.length - 1) / 2) * trackSpacing;

          const p1A = c1.p1 === node ? c1.p2 : c1.p1;
          const p2B = c2.p1 === node ? c2.p2 : c2.p1;

          const dx1 = node.x - p1A.x, dy1 = node.y - p1A.y, l1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
          const nx1 = -dy1 / l1, ny1 = dx1 / l1;
          const pt1 = { x: node.x + nx1 * c1Off, y: node.y + ny1 * c1Off };

          const dx2 = p2B.x - node.x, dy2 = p2B.y - node.y, l2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
          const nx2 = -dy2 / l2, ny2 = dx2 / l2;
          const pt2 = { x: node.x + nx2 * c2Off, y: node.y + ny2 * c2Off };

          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();
        }
      });
    }

    ctx.restore();

    // Draw Overlay Card DOM Nodes Second
    overlay.innerHTML = '';
    nodes.forEach(node => {
      const isFiltered = activeTagFilter === 'all' || node.tags.includes(activeTagFilter);

      const nodeEl = document.createElement('div');
      nodeEl.className = `subway-station-node ${node.isRing ? 'interchange-hub' : ''} ${isFiltered ? 'active-node' : 'dimmed-node'}`;
      nodeEl.style.left = `${node.x}px`;
      nodeEl.style.top = `${node.y}px`;

      const primaryColor = getTagColor(node.tags[0] || 'default');
      nodeEl.style.setProperty('--node-color', primaryColor);

      const titleLen = String(node.post.title || '').length;
      const isFewDots = node.tags.length <= 3 || titleLen > 20;
      const dotsClass = isFewDots ? 'line-dots-inline few-dots' : 'line-dots-inline';

      const dotsHtml = node.tags.map(t => `<span class="inline-dot" style="background-color: ${getTagColor(t)};" title="#${escapeHtml(t)}"></span>`).join('');

      const labelEl = document.createElement('div');
      labelEl.className = 'node-station-label';
      labelEl.innerHTML = `
        <div class="label-meta-row">
          <span class="station-date-sub">${formatSubwayDate(node.post.date)}</span>
          <div class="${dotsClass}">${dotsHtml}</div>
        </div>
        <span class="station-name-text">${escapeHtml(node.post.title)}</span>
      `;
      nodeEl.appendChild(labelEl);

      nodeEl.addEventListener('click', (e) => {
        e.stopPropagation();
        openStationTicket(node, nodeEl);
      });

      overlay.appendChild(nodeEl);
    });
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function openStationTicket(node, nodeEl) {
    activeSelectedStationId = node.post.id;
    const ticketCard = document.getElementById('station-ticket-card');
    if (!ticketCard) return;

    document.getElementById('ticket-title').textContent = node.post.title;
    document.getElementById('ticket-date').textContent = `${formatSubwayDate(node.post.date)} • ${(node.post.categories && node.post.categories[0]) ? node.post.categories[0] : 'article'}`;
    document.getElementById('ticket-excerpt').textContent = node.post.excerpt;
    document.getElementById('ticket-action-btn').href = node.post.url;

    const tagsContainer = document.getElementById('ticket-tags-badges');
    tagsContainer.innerHTML = node.tags.map(t => `
      <span class="ticket-tag-badge" style="background-color: ${getTagColor(t)}; color: #1d1f21;">#${escapeHtml(t)}</span>
    `).join('');

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
