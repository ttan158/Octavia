import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import { Polar } from "@polar-sh/sdk";
import { env } from "~/env";
import {
  polar,
  checkout,
  portal,
  usage,
  webhooks,
} from "@polar-sh/better-auth";

const polarClient = new Polar({
  accessToken: env.POLAR_ACCESS_TOKEN,
  server: "sandbox",
});

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    polar({
      client: polarClient,
      createCustomerOnSignUp: true,
      use: [
        checkout({
          products: [
            {
              productId: "6242ddc6-60c7-4f35-a1aa-09095a96e902",
              slug: "small",
            },
            {
              productId: "fb799617-1874-483a-b642-1ec9ff7468db",
              slug: "medium",
            },
            {
              productId: "efea19c7-18cd-4fc3-b09a-d362fcba8523",
              slug: "large",
            },
          ],
          successUrl: "/",
          authenticatedUsersOnly: true,
        }),
        portal(),
        webhooks({
          secret: env.POLAR_WEBHOOK_SECRET,
          onOrderPaid: async (order) => {
            const externalCustomerId = order.data.customer.externalId;

            if (!externalCustomerId) {
              console.error("No external customer ID found");
              throw new Error("No external customer id found");
            }

            const productId = order.data.productId;

            let creditsToAdd = 0;

            switch (productId) {
              case "6242ddc6-60c7-4f35-a1aa-09095a96e902":
                creditsToAdd = 10;
                break;
              case "fb799617-1874-483a-b642-1ec9ff7468db":
                creditsToAdd = 25;
                break;
              case "efea19c7-18cd-4fc3-b09a-d362fcba8523":
                creditsToAdd = 50;
                break;
            }

            await db.user.update({
              where: { id: externalCustomerId },
              data: {
                credits: {
                  increment: creditsToAdd,
                },
              },
            });
          },
        }),
      ],
    }),
  ],
});
