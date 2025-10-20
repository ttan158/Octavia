"use client";

import { authClient } from "~/lib/auth-client";
import { Button } from "../ui/button";

export default function Upgrade() {
  const upgrade = async () => {
    await authClient.checkout({
      products: [
        "24102eff-39b8-43a6-b2de-aea8c46dae73",
        "7b396a29-4de3-4392-9aaa-f5282f8d6d5d",
        "37179311-0571-499b-ba6a-39b5885eb656",
      ],
    });
  };
  return (
    <Button
      variant="outline"
      size="sm"
      className="ml-2 cursor-pointer text-orange-400"
      onClick={upgrade}
    >
      Upgrade
    </Button>
  );
}
