import { Prisma, prisma } from 'src/prisma.js'
import type {
  Overwrite,
  Page,
  Place,
  PlaceMemberRole,
  TrimProps,
} from 'src/types.js'

export type CreatePlaceInput = {
  place: TrimProps<Place, 'createdAt' | 'id' | 'updatedAt'>
  userOwnerId: string
}

export async function createPlace({
  place,
  userOwnerId,
}: CreatePlaceInput): Promise<Place> {
  return await prisma.place.create({
    data: {
      ...place,
      PlaceMember: {
        create: {
          memberId: userOwnerId,
          role: 'owner',
        },
      },
    },
  })
}

export type UpdatePlaceInput = Overwrite<
  Partial<TrimProps<Place, 'createdAt' | 'updatedAt'>>,
  { id: string }
>

export async function updatePlace(place: UpdatePlaceInput): Promise<Place> {
  const { id, ...data } = place
  return await prisma.place.update({
    data,
    where: {
      id,
    },
  })
}

export type ListPlacesInput = {
  memberId: string
  filter?: {
    name?: string
  }
  orderBy?: {
    name?: 'asc' | 'desc'
    createdAt?: 'asc' | 'desc'
  }
  page: number
  pageSize: number
}

export async function listPlaces({
  page,
  memberId,
  pageSize,
  filter,
  orderBy,
}: ListPlacesInput): Promise<Page<Place>> {
  const where: Prisma.PlaceWhereInput = {
    PlaceMember: {
      some: {
        memberId,
      },
    },
    name: filter?.name
      ? {
          contains: filter.name,
        }
      : undefined,
  }
  const [count, items] = await prisma.$transaction([
    prisma.place.count({ where }),
    prisma.place.findMany({
      where,
      orderBy,
      take: pageSize,
      skip: pageSize * Math.max(page - 1, 0),
    }),
  ])
  return { count, items }
}

export type CheckPlaceMemberInput = Record<'placeId' | 'memberId', string>

export async function checkPlaceMember(
  input: CheckPlaceMemberInput
): Promise<PlaceMemberRole | null> {
  const placeMember = await prisma.placeMember.findUnique({
    where: {
      memberId_placeId: input,
    },
  })
  return placeMember?.role as PlaceMemberRole | null
}

export type GetPlaceInput = Partial<Record<'slug' | 'host' | 'id', string>>

export async function getPlace({
  id,
  host,
  slug,
}: GetPlaceInput): Promise<Place | null> {
  return await prisma.place.findUnique({
    where: {
      id,
      slug,
      customDomain: host,
    },
  })
}
