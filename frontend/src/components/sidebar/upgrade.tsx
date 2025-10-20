"use client";

import { authClient } from "~/lib/auth-client";
import { Button } from "../ui/button";

export default function Upgrade() {
  const upgrade = async () => {
    await authClient.checkout({
      products: [
        "6242ddc6-60c7-4f35-a1aa-09095a96e902",
        "fb799617-1874-483a-b642-1ec9ff7468db",
        "efea19c7-18cd-4fc3-b09a-d362fcba8523",
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
