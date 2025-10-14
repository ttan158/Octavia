import { env } from "~/env";
import { inngest } from "./client";
import { db } from "~/server/db";

export const generateSong = inngest.createFunction(
  { id: "generate-song", concurrency: {
    limit: 1,
    key: "event.data.userId",
  }, 
  onFailure: async ({event, error}) => {
    await db.song.update({
      where: {
        id: event?.data?.event?.data?.songId,
      },
      data: {
        status: "failed",
      }
    })
  }
},
  { event: "generate-song-event" },
  async ({ event, step }) => {
    const {songId} = event.data as {
      songId: string;
      userId: string;
    };

    const {userId, credits, endpoint, body} = await step.run("check-credits", async ()=> {
      const song = await db.song.findUniqueOrThrow({
        where: {
          id: songId
        },
        select:{
          user: {
            select: {
              id: true,
              credits: true
            }
          },
          prompt: true,
          lyrics: true,
          fullDescribedSong: true,
          describedLyrics: true,
          instrumental: true,
          guidanceScale: true,
          inferStep: true,
          audioDuration: true,
          seed: true,
        },
      });

      type RequestBody = {
        guidanceScale?: number;
        inferStep?: number;
        audioDuration?: number;
        seed?: number;
        fullDescribedSong?: string;
        prompt?: string;
        lyrics?: string;
        describedLyrics?: string;
        instrumental?: string;
      }

      let endpoint = "";
      let body: RequestBody = {}

      const commonParams = {
        guidanceScale: song.guidanceScale ?? undefined,
        inferStep: song.inferStep ?? undefined,
        audioDuration: song.audioDuration ?? undefined,
        seed: song.seed ?? undefined,
        instrumental: song.instrumental ?? undefined,
      }
      
      if(song.fullDescribedSong) {
        endpoint = env.GENERATE_FROM_DESCRIPTION;
        body = {
          fullDescribedSong: song.fullDescribedSong,
          ...commonParams,
        };
      }

      else if (song.lyrics && song.prompt) {
        endpoint = env.GENERATE_WITH_LYRICS;
        body = {
          lyrics: song.lyrics,
          prompt: song.prompt,
          ...commonParams,
        }
      }

      else if (song.describedLyrics && song.prompt) {
        endpoint = env.GENERATE_FROM_DESCRIBED_LYRICS;
        body = {
          describedLyrics: song.describedLyrics,
          prompt: song.prompt,
          ...commonParams,
        }
      }

      return {
        userId: song.userId,
        credits: song.user.credits,
        endpoint: endpoint,
        body: body,
      }
    },
  );
    
    if(credits > 0) {
      await step.run("set-status-processing", async () => {
        return await db.song.update({
          where: {
            id: songId,
          },
          data: {
            status: "processing",
          },
        });
      });

      const response = await step.fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "Modal-Key": env.MODAL_KEY,
          "Modal-Secret": env.MODAL_SECRET,
        },
      });

      await step.run("update-song-result", async() => {
        const responseData = response.ok ? ((await response.json()) as {
          s3Key: string;
          coverImageS3Key: string;
          categories: string[]
        })
        : null;

        await db.song.update({
          where: {
            id: songId
          }, data: {
            s3Key: responseData?.s3Key,
            thumbnailS3Key: responseData?.coverImageS3Key,
            status: response.ok ? "processed" : "failed",
          }
        })

        if (responseData && responseData.categories.length > 0){
          await db.song.update({
            where: {id: songId},
            data: {
              categories: {
                connectOrCreate: responseData.categories.map(
                  (categoryName) => ({
                    where: {name: categoryName},
                    create: {name: categoryName},
                  })
                )
              }
            }
          })
        }
      })

      return await step.run("deduct-credits", async () => {
        if (!response.ok) return;

        return await db.user.update({
          where: {id: userId},
          data: {
            credits: {
              decrement: 1,
            },
          },
        })
      })
    } else {
      await step.run("set-status-no-credits", async () => {
        return await db.song.update({
          where: {
            id: songId,
          },
          data: {
            stats: "no credits"
          },
        });
      });
    }
  },
);