export const SEEN_PROBABILITY = 0.4;

const WORDS: readonly string[] = [
  "anchor", "apple", "arrow", "autumn", "bacon", "badge", "banana", "basket",
  "beach", "bell", "berry", "bicycle", "blanket", "bottle", "branch", "bread",
  "breeze", "bridge", "brush", "bucket", "butter", "button", "cabin", "camera",
  "candle", "canyon", "carpet", "castle", "cellar", "chair", "cheese", "cherry",
  "circle", "cloud", "clover", "coffee", "collar", "copper", "corner", "cotton",
  "cradle", "crayon", "cricket", "crystal", "curtain", "daisy", "desert", "diamond",
  "dinner", "dolphin", "donkey", "dragon", "drawer", "eagle", "engine", "fabric",
  "falcon", "feather", "fiddle", "finger", "flame", "forest", "fossil", "fountain",
  "garden", "garlic", "ginger", "glacier", "goblet", "grape", "gravel", "guitar",
  "hammer", "harbor", "helmet", "honey", "hunter", "island", "jacket", "jungle",
  "kettle", "kitten", "ladder", "lantern", "lemon", "lettuce", "lizard", "lobster",
  "locket", "lumber", "magnet", "mantle", "marble", "meadow", "mirror", "mitten",
  "monkey", "mountain", "muffin", "mushroom", "needle", "nickel", "ocean", "onion",
  "orange", "orchard", "oyster", "paddle", "palace", "pancake", "panther", "parrot",
  "pearl", "pebble", "pencil", "pepper", "piano", "pillow", "pirate", "planet",
  "pocket", "pumpkin", "puzzle", "rabbit", "raisin", "ribbon", "river", "rocket",
  "saddle", "salmon", "sandal", "scarf", "shadow", "shelter", "shovel", "silver",
  "spider", "spinach", "spoon", "squirrel", "stable", "statue", "summer", "sunset",
  "sweater", "temple", "thunder", "ticket", "tiger", "timber", "tunnel", "turtle",
  "valley", "velvet", "violin", "walnut", "walrus", "whistle", "window", "winter",
];

export interface WordPick {
  word: string;
  isSeen: boolean;
}

export function nextWord(
  seen: ReadonlySet<string>,
  current: string | null,
  rng: () => number = Math.random,
): WordPick {
  const unseen = WORDS.filter((w) => !seen.has(w) && w !== current);
  const seenPool = [...seen].filter((w) => w !== current);

  const wantSeen =
    seenPool.length > 0 && (unseen.length === 0 || rng() < SEEN_PROBABILITY);

  if (wantSeen) {
    return { word: seenPool[Math.floor(rng() * seenPool.length)]!, isSeen: true };
  }
  return { word: unseen[Math.floor(rng() * unseen.length)]!, isSeen: false };
}
