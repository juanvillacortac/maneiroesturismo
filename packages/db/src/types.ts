import type {
  Comment as _Comment,
  Place as _Place,
  Post as _Post,
  User as _User,
} from "@prisma/client";

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;
export type TrimProps<T, U extends keyof T> = Pick<T, Exclude<keyof T, U>>;
export type Page<T> = {
  count: number;
  items: T[];
};

export type Place = _Place;

export type User = _User;

export type Comment = _Comment;

export const PlaceMemberRole = {
  owner: "owner" as const,
  admin: "admin" as const,
  regular: "regular" as const,
};

export type PlaceMemberRole =
  typeof PlaceMemberRole[keyof typeof PlaceMemberRole];

export type Post = _Post;

export type LayoutType = "app" | "place";
export type PlaceData = {
  theme: Record<"primary", string>;
  information: any;
};

export type AppContext = {
  place?: Place | null;
  placeData?: PlaceData;
  places?: Place[];
};

export type PlaceContext = {
  place?: Place | null;
  placeData?: PlaceData;
};

export type PageContext = {
  layout: LayoutType;
  context: AppContext & PlaceContext;
};
