// ── Tab navigation ────────────────────────────────────────────────────────
function showTab(id) {
  document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
  const section = document.getElementById(id);
  if (section) section.classList.add('active');
  const link = document.querySelector(`nav a[data-tab="${id}"]`);
  if (link) link.classList.add('active');
  history.replaceState(null, '', '#' + id);
}

document.querySelectorAll('[data-tab]').forEach(a => {
  a.addEventListener('click', e => { e.preventDefault(); showTab(a.dataset.tab); window.scrollTo({top:0,behavior:'smooth'}); });
});

const hash = location.hash.replace('#', '');
showTab(['home', 'publications', 'people', 'funding'].includes(hash) ? hash : 'home');

// ── Publications ──────────────────────────────────────────────────────────
function loadPublications() {
  const container = document.getElementById('pub-list');
  if (!container) return;

  const pubs = window.LAB_PUBLICATIONS || [];
  if (!pubs.length) {
    container.innerHTML = '<p style="color:var(--muted)">No publications data found.</p>';
    return;
  }

  const searchInput = document.getElementById('pub-search');
  const typeFilter  = document.getElementById('pub-type');

  function render() {
    const query = searchInput.value.toLowerCase();
    const type  = typeFilter.value;

    const filtered = pubs.filter(p => {
      const matchText = !query ||
        p.title.toLowerCase().includes(query) ||
        p.authors.toLowerCase().includes(query) ||
        p.venue.toLowerCase().includes(query);
      const matchType = !type || p.type === type;
      return matchText && matchType;
    });

    const byYear = {};
    filtered.forEach(p => { (byYear[p.year] = byYear[p.year] || []).push(p); });
    const years = Object.keys(byYear).sort((a, b) => b - a);

    if (!years.length) {
      container.innerHTML = '<p style="color:var(--muted);padding:16px 0">No publications match your search.</p>';
      return;
    }

    container.innerHTML = years.map(yr => `
      <div class="pub-year-group">
        <span class="pub-year-label">${yr}</span>
        ${byYear[yr].map(p => `
          <div class="pub-item">
            <div class="pub-title">
              ${p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${p.title}</a>` : p.title}
            </div>
            <div class="pub-authors">${p.authors}</div>
            <div class="pub-venue">${p.venue}</div>
            <div class="pub-tags">
              <span class="tag tag-${p.type}">${p.type}</span>
              ${p.url ? `<a class="tag" style="background:#f0f0f0;color:#333" href="${p.url}" target="_blank" rel="noopener">PDF / Link</a>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    `).join('');
  }

  searchInput.addEventListener('input', render);
  typeFilter.addEventListener('change', render);
  render();
}

// ── People ────────────────────────────────────────────────────────────────
function loadPeople() {
  const grid = document.getElementById('student-grid');
  if (!grid) return;

  const people = window.LAB_STUDENTS || [];
  if (!people.length) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:14px">No students listed yet.</p>';
    return;
  }

  grid.innerHTML = people.map(p => `
    <div class="person-card">
      <div class="person-photo">
        ${p.photo ? `<img src="${p.photo}" alt="${p.name}">` : '👤'}
      </div>
      <div class="person-name">${p.name}</div>
      <div class="person-level">${p.level} Student · ${p.year}</div>
      <div class="person-research">${p.research}</div>
      <div class="person-links">
        ${p.email    ? `<a href="mailto:${p.email}">Email</a>` : ''}
        ${p.website  ? `<a href="${p.website}" target="_blank" rel="noopener">Website</a>` : ''}
      </div>
    </div>
  `).join('');
}

// ── Funding ───────────────────────────────────────────────────────────────
function loadFunding() {
  const grid = document.getElementById('funding-list');
  if (!grid) return;

  const grants = window.LAB_FUNDING || [];
  if (!grants.length) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:14px">No funding listed yet.</p>';
    return;
  }

  const currentYear = new Date().getFullYear();

  grid.innerHTML = grants.map(g => {
    const endYear = parseInt(g.period.split('–').pop()) || currentYear;
    const active  = endYear >= currentYear;
    return `
      <div class="funding-card${active ? '' : ' inactive'}">
        <div class="funding-card-header">
          <div class="funding-agency">${g.agency}${g.program ? ' · ' + g.program : ''}</div>
          <span class="${active ? 'badge-active' : 'badge-past'}">${active ? 'Active' : 'Completed'}</span>
        </div>
        <div class="funding-card-body">
          <div class="funding-header">
            <div class="funding-title">${g.url ? `<a href="${g.url}" target="_blank" rel="noopener">${g.title}</a>` : g.title}</div>
            ${g.amount ? `<span class="funding-amount">${g.amount}</span>` : ''}
          </div>
          <div class="funding-meta">
            <span>📅 ${g.period}</span>
            ${g.pi ? `<span>👤 ${g.pi}</span>` : ''}
          </div>
          <div class="funding-desc">${g.description}</div>
        </div>
      </div>
    `;
  }).join('');
}

loadPublications();
loadPeople();
loadFunding();
