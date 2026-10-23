/* Presentation-only navigation. Native links still work without JavaScript. */
(() => {
  const scene = document.querySelector('.workspace-scene');
  if (!scene) return;
  const covers = [...scene.querySelectorAll('.dossier')];
  if (!covers.length) return;
  let current = Math.min(2, covers.length - 1);
  function selectCover(index) {
    current = (index + covers.length) % covers.length;
    covers.forEach((cover, position) => {
      let offset = position - current;
      if (offset > covers.length / 2) offset -= covers.length;
      if (offset < -covers.length / 2) offset += covers.length;
      cover.style.setProperty('--offset', offset);
      cover.style.setProperty('--distance', Math.abs(offset));
      cover.style.zIndex = covers.length - Math.abs(offset);
      cover.dataset.active = String(position === current);
    });
    scene.querySelector('[data-scene-title]').textContent = covers[current].dataset.title;
    scene.querySelector('[data-scene-description]').textContent = covers[current].dataset.description;
    scene.querySelector('[data-scene-open]').href = covers[current].href;
    const previousTitle = covers[(current - 1 + covers.length) % covers.length].dataset.title;
    const nextTitle = covers[(current + 1) % covers.length].dataset.title;
    scene.querySelector('[data-scene-prev-title]').textContent = previousTitle;
    scene.querySelector('[data-scene-next-title]').textContent = nextTitle;
    scene.querySelector('[data-scene-prev]').setAttribute('aria-label', `Dossiê anterior: ${previousTitle}`);
    scene.querySelector('[data-scene-next]').setAttribute('aria-label', `Próximo dossiê: ${nextTitle}`);
  }
  scene.classList.add('scene-ready');
  scene.querySelectorAll('.scene-control').forEach(button => { button.hidden = false; });
  scene.querySelector('[data-scene-prev]').addEventListener('click', () => selectCover(current - 1));
  scene.querySelector('[data-scene-next]').addEventListener('click', () => selectCover(current + 1));
  covers.forEach((cover, index) => cover.addEventListener('focus', () => selectCover(index)));
  scene.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const destination = {ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: covers.length - 1}[event.key];
    if (destination === undefined) return;
    event.preventDefault();
    selectCover(destination);
    covers[current].focus({preventScroll: true});
  });
  selectCover(current);
})();
