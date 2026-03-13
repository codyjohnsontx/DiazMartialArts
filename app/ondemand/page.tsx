import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getPublicEnv } from '@/lib/env';
import { getEntitlements } from '@/lib/entitlements';

export default async function OndemandRoutePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/ondemand');
  }

  const entitlements = await getEntitlements(userId);
  const { ondemandUrl } = getPublicEnv();

  redirect(`${ondemandUrl}${entitlements.vod ? '/library' : '/subscribe'}`);
}
