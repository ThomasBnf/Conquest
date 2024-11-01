"use client";

import { useUser } from "context/userContext";
import Image from "next/image";
import Link from "next/link";

export default function Page() {
  const { slug } = useUser();

  return (
    <div className="mx-auto flex max-w-3xl flex-col py-24">
      <p className="text-2xl font-medium">Integrations</p>
      <p className="text-muted-foreground">Synchronize data across platforms</p>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <Link
          href={`/${slug}/settings/integrations/slack`}
          className="flex items-start gap-4 rounded-lg border p-4 hover:bg-muted-hover transition-colors"
        >
          <Image src="/social/slack.svg" alt="Slack" width={24} height={24} />
          <div>
            <p className="text-lg font-medium leading-tight">Slack</p>
            <p className="text-muted-foreground">
              Synchronize your members with Slack
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
