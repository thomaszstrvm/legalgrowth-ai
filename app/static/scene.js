/* Presentation-only navigation. Native links still work without JavaScript. */
(() => {
  const scene = document.querySelector('.workspace-scene');
  if (!scene) return;
  const covers = [...scene.querySelectorAll('.dossier')];
  if (!covers.length) return;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let pointerFrame = 0;
  function resetTilt() {
    cancelAnimationFrame(pointerFrame);
    pointerFrame = 0;
    covers.forEach(cover => {
      cover.style.removeProperty('--tilt-x');
      cover.style.removeProperty('--tilt-y');
    });
  }
  scene.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse' || motion.matches || !finePointer.matches || scene.matches(':has(:focus-visible)')) return;
    const cover = event.target.closest('.dossier[data-active=true]');
    if (!cover) { resetTilt(); return; }
    cancelAnimationFrame(pointerFrame);
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      const box = cover.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - box.left) / box.width * 2 - 1));
      const y = Math.max(-1, Math.min(1, (event.clientY - box.top) / box.height * 2 - 1));
      cover.style.setProperty('--tilt-x', `${(x * 3).toFixed(2)}deg`);
      cover.style.setProperty('--tilt-y', `${(-y * 2).toFixed(2)}deg`);
    });
  });
  scene.addEventListener('pointerleave', resetTilt);
  scene.addEventListener('focusin', resetTilt);
  motion.addEventListener('change', resetTilt);
  finePointer.addEventListener('change', resetTilt);
  document.addEventListener('visibilitychange', resetTilt);
  let current = Math.min(2, covers.length - 1);
  function selectCover(index) {
    resetTilt();
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
  // Reveal enhancement only after selection and all handlers are initialized.
  scene.querySelectorAll('.scene-control').forEach(button => { button.hidden = false; });
  scene.querySelector('.scene-footer').hidden = false;
  scene.classList.add('scene-ready');
})();
