let rafHandle = null;

export function startLoop(state, update, render) {
  function frame(timestamp) {
    update(state, timestamp);
    render(state);
    rafHandle = requestAnimationFrame(frame);
  }
  rafHandle = requestAnimationFrame(frame);
}

export function stopLoop() {
  if (rafHandle !== null) {
    cancelAnimationFrame(rafHandle);
    rafHandle = null;
  }
}
