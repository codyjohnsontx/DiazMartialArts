import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import { getEntitlements } from '@/lib/entitlements';

export default async function OndemandRoutePage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in?redirect_url=/account');
  }

  const entitlements = await getEntitlements(userId);
  const ondemandUrl = process.env.NEXT_PUBLIC_ONDEMAND_URL || 'https://ondemand.diazmartialarts.com';

  redirect(`${ondemandUrl}${entitlements.vod ? '/library' : '/subscribe'}`);
}
