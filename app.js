const $ = selector => document.querySelector(selector);
const page = document.body.dataset.page;
let projects = [];
let videoConfig = {};
const esc = text => String(text).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const roleLabel = role => ({Editor:'Editing',Director:'Direction','Co-director':'Co-direction'}[role] || role);
const arrow = '';

$('#site-header').innerHTML = `<a class="wordmark" href="./index.html" aria-label="Nikolas Roumeliotis, home">NIKOLAS ROUMELIOTIS</a><nav aria-label="Main navigation">${['work','about','contact'].map(item => `<a href="./${item}.html"${page === item || (page === 'project' && item === 'work') ? ' aria-current="page"' : ''}>${item.toUpperCase()}</a>`).join('')}</nav>`;
$('#site-footer').innerHTML = `<span>© ${new Date().getFullYear()} NIKOLAS ROUMELIOTIS</span><span>ATHENS, GREECE</span><a href="mailto:nikolasroumeliotis@gmail.com">LET’S COLLABORATE ${arrow}</a>`;

function attachVideo(container, videoId, title, autoplay = false) {
  container.replaceChildren();
  container.hidden = true;
  if (!videoConfig.bunnyLibraryId || !videoId) return false;
  const iframe = document.createElement('iframe');
  const startAutomatically = autoplay && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  const params = new URLSearchParams({autoplay:String(startAutomatically),muted:String(autoplay),loop:String(autoplay),preload:String(autoplay),playsinline:'true',showHeatmap:'false',lang:'en'});
  iframe.src = `https://player.mediadelivery.net/embed/${encodeURIComponent(videoConfig.bunnyLibraryId)}/${encodeURIComponent(videoId)}?${params}`;
  iframe.title = title;
  iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
  iframe.allowFullscreen = true;
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  container.append(iframe);
  container.hidden = false;
  return true;
}

function home() {
  $('#film-title').textContent = 'SHOWREEL';
  $('#film-caption').textContent = 'NIKOLAS ROUMELIOTIS / SHOWREEL';
  $('#film-link').href = './work.html';
  $('#film-link').innerHTML = `EXPLORE THE WORK ${arrow}`;
  const hasVideo = Boolean(videoConfig.cdnHostname && videoConfig.showreelVideoId);
  if (hasVideo) {
    const video = document.createElement('video');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.autoplay = !reducedMotion.matches;
    video.preload = 'metadata';
    video.poster = $('#film-image').src;
    video.tabIndex = 0;
    video.setAttribute('aria-label', 'Showreel. Press space to pause or play.');
    const quality = matchMedia('(max-width: 600px)').matches ? '720' : '1080';
    video.src = `https://${videoConfig.cdnHostname}/${encodeURIComponent(videoConfig.showreelVideoId)}/play_${quality}p.mp4`;
    $('#film-player').replaceChildren(video);
    $('#film-player').hidden = false;
    const play = () => video.play().catch(() => {});
    const idleLimit = 2 * 60 * 1000;
    let lastActivity = Date.now();
    let idleTimer;
    let idlePaused = false;
    let userPaused = false;
    const scheduleIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        idlePaused = true;
        video.pause();
      }, idleLimit);
    };
    const onActivity = () => {
      if (document.hidden) return;
      lastActivity = Date.now();
      const wasIdle = idlePaused;
      idlePaused = false;
      scheduleIdle();
      if (wasIdle && !userPaused && !reducedMotion.matches) play();
    };
    ['pointermove', 'pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(type => {
      document.addEventListener(type, onActivity, {passive:true});
    });
    scheduleIdle();
    if (!reducedMotion.matches) play();
    video.addEventListener('keydown', event => {
      if (event.code !== 'Space') return;
      event.preventDefault();
      userPaused = !video.paused;
      if (userPaused) video.pause();
      else { idlePaused = false; play(); }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        clearTimeout(idleTimer);
        video.pause();
      } else {
        idlePaused = Date.now() - lastActivity >= idleLimit;
        if (!idlePaused && !userPaused && !reducedMotion.matches) {
          play();
          clearTimeout(idleTimer);
          idleTimer = setTimeout(() => { idlePaused = true; video.pause(); }, idleLimit - (Date.now() - lastActivity));
        }
      }
    });
    window.addEventListener('pagehide', () => { clearTimeout(idleTimer); video.pause(); });
    reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) video.pause(); });
  }
  $('#film-image').hidden = hasVideo;
  $('.cinema').classList.toggle('has-video', hasVideo);
}

function work() {
  $('#works').innerHTML = projects.map((project, index) => `<a class="work-entry work-entry-${index}" data-project="${esc(project.slug)}" href="./project.html?film=${encodeURIComponent(project.slug)}"><div class="work-image"><img src="${esc(project.image)}" alt="${esc(project.alt)}"${index ? ' loading="lazy"' : ''}><div class="work-preview" aria-hidden="true"></div></div><div class="work-heading"><h2>${esc(project.title)}</h2></div><p>${esc(roleLabel(project.role))} <span>/ ${esc(project.format)}${project.year ? ` / ${esc(project.year)}` : ''}</span></p></a>`).join('');
  revealWork();
  const hover = matchMedia('(min-width: 601px) and (hover: hover) and (pointer: fine)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let activeCard = null;
  let timer;
  function stopPreview() {
    clearTimeout(timer);
    if (!activeCard) return;
    const video = activeCard.querySelector('video');
    if (video) {
      video.pause();
      video.removeAttribute('src');
      video.load();
      video.remove();
    }
    activeCard.classList.remove('is-previewing');
    activeCard = null;
  }
  document.querySelectorAll('[data-project]').forEach(card => {
    const project = projects.find(item => item.slug === card.dataset.project);
    const id = project.previewVideoId || project.bunnyVideoId;
    card.addEventListener('pointerenter', event => {
      if (event.pointerType === 'touch' || !hover.matches || reducedMotion.matches || !id || !videoConfig.cdnHostname) return;
      stopPreview();
      activeCard = card;
      timer = setTimeout(() => {
        if (activeCard !== card) return;
        const video = document.createElement('video');
        video.muted = true;
        video.defaultMuted = true;
        video.loop = true;
        video.playsInline = true;
        video.preload = 'none';
        video.tabIndex = -1;
        video.setAttribute('aria-hidden', 'true');
        video.src = `https://${videoConfig.cdnHostname}/${encodeURIComponent(id)}/play_1080p.mp4`;
        video.addEventListener('playing', () => {
          if (activeCard === card) card.classList.add('is-previewing');
          else video.pause();
        });
        video.addEventListener('error', () => { if (activeCard === card) stopPreview(); });
        if (!project.previewVideoId) video.addEventListener('timeupdate', () => {
          if (video.currentTime > 12) video.currentTime = 0;
        });
        card.querySelector('.work-preview').append(video);
        video.play().catch(() => { if (activeCard === card) stopPreview(); });
      }, 160);
    });
    card.addEventListener('pointerleave', () => { if (activeCard === card) stopPreview(); });
  });
  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.target === activeCard && !entry.isIntersecting)) stopPreview();
  });
  document.querySelectorAll('[data-project]').forEach(card => observer.observe(card));
  document.addEventListener('visibilitychange', () => { if (document.hidden) stopPreview(); });
  window.addEventListener('pagehide', stopPreview);
  window.addEventListener('blur', stopPreview);
  reducedMotion.addEventListener('change', stopPreview);
  hover.addEventListener('change', stopPreview);
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
  $('#project-content').innerHTML = `<div class="project-top"><a class="back-link" href="./work.html">ALL WORK</a><span>${project.year ? `${esc(project.year)} / ` : ''}${esc(project.format.toUpperCase())}</span></div><h1 class="project-title">${esc(project.title)}</h1><div class="project-media"><img src="${esc(project.image)}" alt="${esc(project.alt)}" id="project-still"><div id="project-player" class="film-player" hidden></div></div><div class="project-details"><div><p class="role-label">NIKOLAS’S ROLE</p><p class="project-role">${esc(roleLabel(project.role))}</p></div><div><p class="project-summary">${esc(project.summary)}</p><dl class="credits">${project.credits.map(item => `<div><dt>${esc(item.label)}</dt><dd>${esc(item.value)}</dd></div>`).join('')}</dl>${project.originalUrl ? `<a class="line-link original-link" href="${esc(project.originalUrl)}" target="_blank" rel="noopener noreferrer">${esc(project.originalLinkLabel || 'Original project')} ${arrow}</a>` : ''}</div></div>${project.gallery?.length ? `<section class="project-gallery" aria-label="Film stills">${project.gallery.map(still => `<img src="${esc(still.image)}" alt="${esc(still.alt)}" loading="lazy">`).join('')}</section>` : ''}<a class="next-project" href="./project.html?film=${encodeURIComponent(next.slug)}"><span>NEXT FILM</span><strong>${esc(next.title)}</strong>${arrow}</a>`;
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
    if (page === 'project') { projectPage(); titleEntrance(); }
  } catch (error) {
    const message = document.createElement('p');
    message.className = 'load-error';
    message.innerHTML = 'The projects couldn’t load. <a href="">Reload this page</a> or <a href="mailto:nikolasroumeliotis@gmail.com">get in touch</a>.';
    $('main').append(message);
    console.error(error);
  }
}
init();

// Content stays visible if animation or observation is unavailable.
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const motionAnimations = new Set();
function entrance(element, frames, delay = 0, duration = 680) {
  if (!element || motionPreference.matches || !element.animate) return;
  const animation = element.animate(frames, {
    duration, delay, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards'
  });
  motionAnimations.add(animation);
  animation.finished.catch(() => {}).finally(() => motionAnimations.delete(animation));
}
function revealWork() {
  if (motionPreference.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const card = entry.target;
      entrance(card.querySelector('.work-image'), [
        {opacity: .65, clipPath: 'inset(0 0 7% 0)'},
        {opacity: 1, clipPath: 'inset(0 0 0% 0)'}
      ], Number(card.dataset.motionDelay), 820);
      observer.unobserve(card);
    });
  }, {threshold: .08});
  document.querySelectorAll('.work-entry').forEach((card, index) => {
    card.dataset.motionDelay = window.innerWidth > 600 ? (index % 2) * 90 : 0;
    observer.observe(card);
  });
  motionPreference.addEventListener('change', () => {
    if (motionPreference.matches) observer.disconnect();
  });
}
function titleEntrance() {
  entrance($('.wordmark'), [
    {opacity: .7, transform: 'translateY(6px)'},
    {opacity: 1, transform: 'translateY(0)'}
  ], 0, 520);
  entrance($('.page-heading h1, .about-title, .contact-title, .project-title, .cinema-caption'), [
    {opacity: .65, transform: 'translateY(14px)'},
    {opacity: 1, transform: 'translateY(0)'}
  ], 80);
}
motionPreference.addEventListener('change', () => {
  if (motionPreference.matches) motionAnimations.forEach(animation => animation.cancel());
});
titleEntrance();
