/**
 * The rules for reading the Diaz on Demand app's configuration.
 *
 * This is plain ESM rather than TypeScript so `next.config.mjs` and `lib/env.ts`
 * can share one copy. They have to agree: the config decides whether `/ondemand`
 * is a real HTTP redirect to the member app, and the runtime decides whether the
 * page renders the coming-soon content instead. If the two ever drifted, one
 * would forward while the other rendered.
 */

/**
 * Resolves NEXT_PUBLIC_ONDEMAND_URL to the member app URL, or undefined when
 * there is nowhere to send people yet.
 *
 * The Diaz on Demand app has no URL yet, so `.env.example` ships a placeholder
 * on the RFC 2606 reserved `.invalid` TLD, which can never resolve. Treat that
 * placeholder exactly like an unset value: the site hides its member entry
 * points rather than pointing them at a host that does not exist. A malformed
 * value still throws, so a real typo fails loudly instead of going quiet.
 *
 * @param {string | undefined} rawValue
 * @returns {string | undefined}
 */
export function resolveOndemandUrl(rawValue) {
  const trimmed = rawValue?.trim();
  if (!trimmed) return undefined;

  let url;
  try {
    url = new URL(trimmed);
  } catch {
    throw new Error(
      '[env] NEXT_PUBLIC_ONDEMAND_URL must be a full absolute URL including protocol. Example: https://diazmartialarts.vercel.app',
    );
  }

  return url.hostname.endsWith('.invalid') ? undefined : url.toString();
}

/**
 * Resolves ONDEMAND_COMING_SOON, which pins /ondemand to the coming-soon page
 * even once the member app URL is configured.
 *
 * @param {string | undefined} rawValue
 * @returns {boolean}
 */
export function resolveOndemandComingSoon(rawValue) {
  return rawValue?.trim().toLowerCase() === 'true';
}
