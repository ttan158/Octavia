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
  server: "production",
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
              productId: "37179311-0571-499b-ba6a-39b5885eb656",
              slug: "small",
            },
            {
              productId: "7b396a29-4de3-4392-9aaa-f5282f8d6d5d",
              slug: "medium",
            },
            {
              productId: "24102eff-39b8-43a6-b2de-aea8c46dae73",
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
              case "37179311-0571-499b-ba6a-39b5885eb656":
                creditsToAdd = 10;
                break;
              case "7b396a29-4de3-4392-9aaa-f5282f8d6d5d":
                creditsToAdd = 25;
                break;
              case "24102eff-39b8-43a6-b2de-aea8c46dae73":
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
