// The game supplies its normal input handler so touch uses the same four lanes as the keyboard.
function bindTankTouchControls(press, unlockAudio) {
  const stick = document.getElementById('stick');
  const knob = document.getElementById('stickKnob');
  const fire = document.getElementById('bFire');
  let direction = null;

  function setDirection(next) {
    if (next === direction) return;
    if (direction) press(direction, false);
    direction = next;
    if (next) press(next, true);
  }

  function move(event) {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width / 2;
    const x = event.clientX - rect.left - radius;
    const y = event.clientY - rect.top - rect.height / 2;
    const distance = Math.hypot(x, y);
    const travel = radius - knob.offsetWidth / 2 - 2;
    const scale = distance > travel ? travel / distance : 1;
    knob.style.transform = 'translate(' + x * scale + 'px,' + y * scale + 'px)';

    if (distance < radius * (direction ? 0.13 : 0.20)) {
      setDirection(null);
      return;
    }
    const ax = Math.abs(x), ay = Math.abs(y);
    let horizontal = ax > ay;
    if (direction && Math.min(ax, ay) > Math.max(ax, ay) * 0.80) {
      horizontal = direction === 'KeyA' || direction === 'KeyD';
    }
    if (horizontal) setDirection(x < 0 ? 'KeyA' : 'KeyD');
    else setDirection(y < 0 ? 'KeyW' : 'KeyS');
  }

  function captureControl(element, start, drag, end) {
    let pointer = null;
    function release(event) {
      if (pointer === null || (event && event.pointerId !== pointer)) return;
      const id = pointer;
      pointer = null;
      end();
      if (element.hasPointerCapture(id)) element.releasePointerCapture(id);
    }
    element.addEventListener('pointerdown', event => {
      if (pointer !== null || event.button !== 0) return;
      event.preventDefault();
      pointer = event.pointerId;
      element.setPointerCapture(pointer);
      unlockAudio();
      start(event);
    });
    if (drag) element.addEventListener('pointermove', event => {
      if (event.pointerId === pointer) drag(event);
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
      element.addEventListener(type, release);
    }
    element.addEventListener('contextmenu', event => event.preventDefault());
    return release;
  }

  const releaseStick = captureControl(stick, event => {
    stick.classList.add('engaged');
    move(event);
  }, move, () => {
    setDirection(null);
    stick.classList.remove('engaged');
    knob.style.transform = '';
  });
  const releaseFire = captureControl(fire, () => press('Space', true), null, () => press('Space', false));

  function reset() {
    releaseStick();
    releaseFire();
  }
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  return reset;
}
