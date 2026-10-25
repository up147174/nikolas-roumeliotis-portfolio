const $ = selector => document.querySelector(selector);
const page = document.body.dataset.page;
let projects = [];
let videoConfig = {};
const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const arrow = '<span class="arrow" aria-hidden="true"></span>';

$('#site-header').innerHTML = `<a class="wordmark" href="./index.html" aria-label="Nikolas Roumeliotis, home">NIKOLAS ROUMELIOTIS</a><nav aria-label="Main navigation">${['work','about','contact'].map(item => `<a href="./${item}.html"${page === item || (page === 'project' && item === 'work') ? ' aria-current="page"' : ''}>${item.toUpperCase()}</a>`).join('')}</nav>`;
$('#site-footer').innerHTML = `<span>© ${new Date().getFullYear()} NIKOLAS ROUMELIOTIS</span><span>ATHENS, GREECE</span><a href="mailto:nikolasroumeliotis@gmail.com">LET’S COLLABORATE ${arrow}</a>`;

function attachVideo(container, videoId, title, autoplay = false) {
  container.replaceChildren();
  container.hidden = true;
  if (!videoConfig.bunnyLibraryId || !videoId) return false;
  const iframe = document.createElement('iframe');
  const params = new URLSearchParams({autoplay:String(autoplay),muted:String(autoplay),playsinline:'true'});
  iframe.src = `https://player.mediadelivery.net/embed/${encodeURIComponent(videoConfig.bunnyLibraryId)}/${encodeURIComponent(videoId)}?${params}`;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  container.append(iframe);
  container.hidden = false;
  return true;
}

function selectHome(index) {
  const project = projects[index];
  $('#film-image').src = project.image;
  $('#film-image').alt = project.alt;
  $('#film-title').textContent = project.title.toUpperCase();
  $('#film-caption').textContent = `${project.format.toUpperCase()} / ${project.role === 'Editor' ? 'EDITING' : 'CO-DIRECTION'} / ${project.year}`;
  $('#film-link').href = `./project.html?film=${encodeURIComponent(project.slug)}`;
  $('#film-link').innerHTML = `EXPLORE PROJECT ${arrow}`;
  document.querySelectorAll('.film-marker').forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
  const hasVideo = attachVideo($('#film-player'), project.bunnyVideoId, project.title, true);
  $('#film-image').hidden = hasVideo;
  $('.cinema').classList.toggle('has-video', hasVideo);
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) $('#film-title').animate([{opacity:.35},{opacity:1}],{duration:400,easing:'cubic-bezier(.16,1,.3,1)'});
}

function home() {
  const defaultIndex = Math.max(0, projects.findIndex(project => project.slug === 'how-to-disappear'));
  $('#film-switcher').innerHTML = projects.map((project,index) => `<button class="film-marker" type="button" aria-label="Show ${esc(project.title)}" aria-pressed="false" data-film="${index}"><span></span><span class="marker-name">${esc(project.title)}</span></button>`).join('');
  $('#film-switcher').addEventListener('click', event => {
    const button = event.target.closest('[data-film]');
    if (button) selectHome(Number(button.dataset.film));
  });
  selectHome(defaultIndex);
  if (videoConfig.showreelVideoId && videoConfig.bunnyLibraryId) {
    attachVideo($('#film-player'), videoConfig.showreelVideoId, 'Nikolas Roumeliotis — Showreel', true);
    $('#film-image').hidden = true;
    $('.cinema').classList.add('has-video');
    $('#film-title').textContent = 'SELECTED MOMENTS';
    $('#film-caption').textContent = 'NIKOLAS ROUMELIOTIS / SHOWREEL';
    $('#film-link').href = './work.html';
    $('#film-link').innerHTML = `EXPLORE THE WORK ${arrow}`;
    document.querySelectorAll('.film-marker').forEach(button => button.setAttribute('aria-pressed','false'));
  }
}

function work() {
  $('#works').innerHTML = projects.map((project, index) => `<a class="work-entry work-entry-${index}" href="./project.html?film=${encodeURIComponent(project.slug)}"><div class="work-image"><img src="${esc(project.image)}" alt="${esc(project.alt)}"${index ? ' loading="lazy"' : ''}><span class="work-explore">EXPLORE ${arrow}</span></div><div class="work-heading"><h2>${esc(project.title)}</h2>${arrow}</div><p>${esc(project.role === 'Editor' ? 'Editing' : 'Co-direction')} <span>/ ${esc(project.format)} / ${esc(project.year)}</span></p></a>`).join('');
}

function projectPage() {
  const slug = new URLSearchParams(location.search).get('film');
  const index = projects.findIndex(project => project.slug === slug);
  if (index < 0) {
    $('#project-content').innerHTML = '<div class="not-found"><h1>Film not found.</h1><a class="line-link" href="./work.html">Back to the work</a></div>';
    return;
  }
  const project = projects[index];
  const next = projects[(index + 1) % projects.length];
  document.title = `${project.title} — Nikolas Roumeliotis`;
  $('#project-content').innerHTML = `<div class="project-top"><a class="back-link" href="./work.html">ALL WORK</a><span>${esc(project.year)} / ${esc(project.format.toUpperCase())}</span></div><h1 class="project-title">${esc(project.title)}</h1><div class="project-media"><img src="${esc(project.image)}" alt="${esc(project.alt)}" id="project-still"><div id="project-player" class="film-player" hidden></div></div><div class="project-details"><div><p class="role-label">NIKOLAS’S ROLE</p><p class="project-role">${esc(project.role === 'Editor' ? 'Editing' : 'Co-direction')}</p></div><div><p class="project-summary">${esc(project.summary)}</p><dl class="credits">${project.credits.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl><a class="line-link original-link" href="${esc(project.originalUrl)}" target="_blank" rel="noopener noreferrer">Original project ${arrow}</a></div></div><a class="next-project" href="./project.html?film=${encodeURIComponent(next.slug)}"><span>NEXT FILM</span><strong>${esc(next.title)}</strong>${arrow}</a>`;
  if (attachVideo($('#project-player'), project.bunnyVideoId, project.title)) $('#project-still').hidden = true;
}

async function init() {
  if (!['home','work','project'].includes(page)) return;
  try {
    const responses = await Promise.all([fetch('./content/projects.json', {cache:'no-cache'}),fetch('./content/video.json', {cache:'no-cache'})]);
    if (responses.some(response => !response.ok)) throw new Error('Could not load portfolio content');
    [projects, videoConfig] = await Promise.all(responses.map(response => response.json()));
    if (!Array.isArray(projects) || !projects.length) throw new Error('No projects available');
    if (page === 'home') home();
    if (page === 'work') work();
    if (page === 'project') projectPage();
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'load-error';
    message.innerHTML = 'The projects couldn’t load. <a href="">Reload this page</a> or <a href="mailto:nikolasroumeliotis@gmail.com">get in touch</a>.';
    $('main').append(message);
    console.error(error);
  }
}
init();
