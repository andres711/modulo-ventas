export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function vibrate(ms = 40) {
  try {
    if (navigator?.vibrate) navigator.vibrate(ms);
  } catch {
    // Ignora errores de vibracion en dispositivos no compatibles.
  }
}
