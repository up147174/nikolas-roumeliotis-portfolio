const $ = (selector) => document.querySelector(selector);
let projects = [];
let bunnyLibraryId = '';
let activeIndex = 0;

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

function renderIndex() {
  $('#project-tabs').innerHTML = projects.map((project, index) => `
    <button type="button" class="project-tab${index === activeIndex ? ' active' : ''}" role="tab" aria-selected="${index === activeIndex}" aria-controls="stage-image" data-index="${index}">
      <span class="tab-number">0${index + 1}</span><span class="tab-name">${escapeHtml(project.title)}</span><span class="tab-year">${escapeHtml(project.year)}</span>
    </button>`).join('');
  $('#project-tabs').addEventListener('click', event => {
    const tab = event.target.closest('[data-index]');
    if (tab) selectProject(Number(tab.dataset.index));
  });
  $('#project-tabs').addEventListener('keydown', event => {
    if (!['ArrowDown','ArrowUp','ArrowRight','ArrowLeft'].includes(event.key)) return;
    event.preventDefault();
    const delta = ['ArrowDown','ArrowRight'].includes(event.key) ? 1 : -1;
    const next = (activeIndex + delta + projects.length) % projects.length;
    selectProject(next);
    $(`.project-tab[data-index="${next}"]`).focus();
  });
}

function renderGrid() {
  $('#work-grid').innerHTML = projects.map((project, index) => `
    <button type="button" class="work-card" data-work-index="${index}" aria-label="Explore ${escapeHtml(project.title)}">
      <span class="card-image"><img src="${escapeHtml(project.image)}" alt="${escapeHtml(project.alt)}" loading="lazy"><span class="card-arrow" aria-hidden="true">↗</span></span>
      <span class="card-meta"><span>0${index + 1} / ${escapeHtml(project.role.toUpperCase())}</span><span>${escapeHtml(project.year)}</span></span>
      <span class="card-title">${escapeHtml(project.title)}</span>
    </button>`).join('');
  $('#work-grid').addEventListener('click', event => {
    const card = event.target.closest('[data-work-index]');
    if (!card) return;
    selectProject(Number(card.dataset.workIndex));
    $('#selected-project').scrollIntoView({behavior: 'smooth'});
  });
}

function selectProject(index) {
  activeIndex = index;
  const project = projects[index];
  document.querySelectorAll('.project-tab').forEach((tab, i) => {
    tab.classList.toggle('active', i === index);
    tab.setAttribute('aria-selected', String(i === index));
  });
  const image = $('#hero-image');
  image.src = project.image;
  image.alt = project.alt;
  $('#stage-stamp').textContent = `NR—00${index + 1} / MOTION PICTURE`;
  $('#hero-role').textContent = `${project.role.toUpperCase()} / ${project.format.toUpperCase()}`;
  $('#hero-title').innerHTML = `${escapeHtml(project.title.toUpperCase())}<span class="title-dot">.</span>`;
  $('#hero-description').textContent = project.description;
  $('#hero-cta').setAttribute('aria-label', `Explore ${project.title}`);
  $('.hero-bottom span:last-child').textContent = `0${index + 1} / 0${projects.length}`;
  $('#detail-category').textContent = `${project.format.toUpperCase()} / ${project.year}`;
  $('#detail-title').textContent = project.title;
  $('#detail-summary').textContent = project.summary;
  $('#detail-facts').innerHTML = project.credits.map(item => `<div><dt>${escapeHtml(item.label)}</dt><dd>${escapeHtml(item.value)}</dd></div>`).join('');
  $('#detail-original').href = project.originalUrl;
  const frame = $('#video-frame');
  frame.replaceChildren();
  frame.hidden = true;
  image.hidden = false;
  if (bunnyLibraryId && project.bunnyVideoId) {
    const player = document.createElement('iframe');
    player.title = `${project.title} video`;
    player.src = `https://player.mediadelivery.net/embed/${encodeURIComponent(bunnyLibraryId)}/${encodeURIComponent(project.bunnyVideoId)}?autoplay=true&muted=true&playsinline=true`;
    player.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    player.allowFullscreen = true;
    player.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.append(player);
    frame.hidden = false;
    image.hidden = true;
  }
}

async function init() {
  $('#year').textContent = new Date().getFullYear();
  try {
    const [projectResponse, videoResponse] = await Promise.all([fetch('./content/projects.json'), fetch('./content/video.json')]);
    if (!projectResponse.ok || !videoResponse.ok) throw new Error('Content unavailable');
    projects = await projectResponse.json();
    bunnyLibraryId = (await videoResponse.json()).bunnyLibraryId || '';
    renderIndex();
    renderGrid();
    selectProject(0);
  } catch (error) {
    $('#project-tabs').innerHTML = '<p class="load-error">Projects could not load. Please refresh the page.</p>';
    console.error(error);
  }
}
init();
