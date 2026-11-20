// Save only the state carried between stages. The engine rebuilds the battlefield on resume.
function createTank3DCheckpoint(pack) {
  const key = 'tk3d_checkpoint_v1_' + pack.id;
  const layout = pack.builtin ? pack.id : JSON.stringify(pack.stages);
  let current = null;

  function playerStats({lives, score, star}) {
    return {lives, score, star};
  }
  function validPlayer(player) {
    return player && Number.isSafeInteger(player.lives) && player.lives >= 0 &&
      Number.isSafeInteger(player.score) && player.score >= 0 &&
      Number.isInteger(player.star) && player.star >= 0 && player.star <= 3;
  }

  try {
    const saved = JSON.parse(localStorage.getItem(key));
    if (saved && saved.layout === layout &&
        Number.isInteger(saved.stage) && saved.stage >= 0 && saved.stage < pack.stages.length &&
        Array.isArray(saved.players) && [1, 2].includes(saved.players.length) &&
        saved.players.every(validPlayer) && saved.players.some(player => player.lives > 0)) {
      current = {stage: saved.stage, players: saved.players.map(playerStats)};
    }
  } catch {
    // An unreadable save should still allow starting a new game.
  }

  return {
    get current() { return current; },
    save(stage, players) {
      current = stage < pack.stages.length ? {stage, players: players.map(playerStats)} : null;
      try {
        if (current) localStorage.setItem(key, JSON.stringify({...current, layout}));
        else localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    }
  };
}
