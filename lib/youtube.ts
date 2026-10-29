/**
 * The two YouTube URLs the dice page derives from a face's `youtubeId`
 * (content/dice.ts). Kept together so the thumbnail and the player can never
 * name different videos, and so the id format the content file promises is
 * checked in one place.
 */

/** A YouTube video id: eleven characters from the URL-safe base64 alphabet. */
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

export function isYouTubeId(value: string): boolean {
  return YOUTUBE_ID.test(value);
}

/**
 * The still shown before the visitor asks for the video. `hqdefault` exists
 * for every video (the larger `maxresdefault` does not), at 480x360 with the
 * 16:9 frame letterboxed inside it; rendering it `object-cover` in a 16:9 box
 * crops exactly those bars away. It is served by YouTube itself, so it needs
 * no entry in next.config's image allow-list and no pass through the
 * optimiser.
 */
export function youtubeThumbnailUrl(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

/**
 * The player, on the privacy-enhanced host: youtube-nocookie.com sets no
 * tracking cookie until the visitor presses play. `rel=0` keeps the end screen
 * to the same channel rather than whatever YouTube would otherwise suggest,
 * and `autoplay=1` starts the video, because the iframe only exists once the
 * visitor has tapped the still to ask for it.
 */
export function youtubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`;
}
