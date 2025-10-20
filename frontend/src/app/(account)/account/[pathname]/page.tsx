import { AccountView } from "@daveyplate/better-auth-ui";
import { accountViewPaths } from "@daveyplate/better-auth-ui/server";
import { House } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
export const dynamicParams = false;
export function generateStaticParams() {
  return Object.values(accountViewPaths).map((pathname) => ({ pathname }));
}
export default async function AccountPage({
  params,
}: {
  params: Promise<{ pathname: string }>;
}) {
  const { pathname } = await params;
  return (
    <main className="container p-4 md:p-6">
      <Button asChild className="self-start" variant="outline">
        <Link href="/" aria-label="Home">
          <House className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>
      <AccountView pathname={pathname} />
    </main>
  );
}
