import * as db from '@pkg/db'
import { procedure, t } from 'src/router.js'
import { z } from 'zod'
import { TRPCError } from '@trpc/server'

const authProcedure = procedure.meta({ auth: 'user' })

const placeData = t.router({
  upsert: authProcedure
    .input(
      z.object({
        placeId: z.string(),
        placeData: z.object({
          information: z.object({
            nodes: z.any().array(),
          }),
          theme: z.object({
            primary: z.string(),
          }),
        }),
      })
    )
    .mutation(async ({ input: { placeData, placeId }, ctx }) => {
      const role = await db.checkPlaceMember(
        {
          memberId: ctx.userId || '',
          placeId,
        },
        ctx.prisma
      )
      if (!role) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'Este usuario no tiene los permisos necesarios para actualizar este sitio',
        })
      }
      return await db.upsertPlaceData({ placeData, placeId }, ctx.prisma)
    }),
})

const mutations = t.router({
  create: authProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug: z.string().min(1),
      })
    )
    .mutation(({ input, ctx }) =>
      db.createPlace({ place: input, userOwnerId: ctx.userId! }, ctx.prisma)
    ),
  update: authProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(2).optional(),
        slug: z.string().min(1).optional(),
        logo: z.string().nullish(),
        coverImage: z.string().nullish(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const role = await db.checkPlaceMember({
        memberId: ctx.userId || '',
        placeId: input.id,
      })
      if (!role || role == 'facilitador') {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message:
            'Este usuario no tiene los permisos necesarios para actualizar este sitio',
        })
      }
      return await db.updatePlace(input)
    }),
  delete: authProcedure.input(z.string()).mutation(async ({ ctx, input }) => {
    const role = await db.checkPlaceMember({
      memberId: ctx.userId || '',
      placeId: input,
    })
    if (!role || role != 'administrador') {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Este usuario no tiene los permisos necesarios para eliminar',
      })
    }
    await db.deletePlace(input, ctx.prisma)
  }),
})

const queries = t.router({
  members: procedure
    .input(
      z.object({
        placeId: z.string(),
        ids: z.string().array().optional(),
        filter: z.string().optional(),
        orderBy: z
          .object({
            name: z.enum(['asc', 'desc']).optional(),
            email: z.enum(['asc', 'desc']).optional(),
            createdAt: z.enum(['asc', 'desc']).optional(),
          })
          .optional(),
        page: z.number().optional().default(1),
        pageSize: z.number().optional().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      return await db.listUsers(input, ctx.prisma)
    }),
  get: procedure
    .input(
      z.object({
        id: z.string().optional(),
        slug: z.string().optional(),
        host: z.string().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const data: db.PlaceContext = {}
      data.place = await db.getPlace(input, ctx.prisma)
      if (data.place) {
        data.placeData = await db.getPlaceData(data.place.id, ctx.prisma)
      }
      return data
    }),
})

export default t.mergeRouters(
  mutations,
  queries,
  t.router({
    placeData,
  })
)
