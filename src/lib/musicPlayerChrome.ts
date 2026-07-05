type Listener = () => void;

let playerBarActive = false;
const listeners = new Set<Listener>();

export function setMusicPlayerBarActive(active: boolean) {
  if (playerBarActive === active) return;
  playerBarActive = active;
  listeners.forEach((listener) => listener());
}

export function getMusicPlayerBarActive() {
  return playerBarActive;
}

export function subscribeMusicPlayerBarActive(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
