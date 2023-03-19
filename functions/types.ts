import {ImageAsset, Reference, Slug} from "@sanity/types";

export type SanityUser = {
    _id: string,
    displayName: string,
    email: string,
    username: string
}

export type SanityLike = {
    _id: string,
    liker: Reference,
    likee: Reference,
    likeCategory: string
}

export type SanityFollow = {
    _id: string,
    follower: Reference,
    followed: Reference,
}

export type Height = {
    feet: number,
    inches: number
}

export type SanityExtendedUserProfile = {
    _id: string,
    age: number,
    weight: number,
    height: Height,
    gender: string,
    shortBio: string,
    longBio: string,
    partnerStatus: string,
    pronouns: string[],
    hashtags: string[],
    ethnicity: string,
    userId: string,
    iAm: string,
    imInto: string,
    imOpenTo: string,
    whatIDo: string,
    whatImLookingFor: string,
    whatInterestsMe: string,
    whereILive: string,
    sexPreferences: string,
    nsfwFriendly: boolean,
    isTraveling: boolean,
    hivStatus: string,
    lastTested: Date,
    facebook: string,
    instagram: string,
    twitter: string,
}


export type SanityPost = {
    _id: string,
    slug: Slug,
    author: SanityUser,

    image: ImageAsset,
    categories: SanityCategory[],
    publishedAt: Date,
    body: string,
}
export type SanityComment = {
    _id: string,
    author: SanityUser,
    recipient: SanityUser,

    publishedAt: Date,
    body: string,
}

export type SanityCategory = {
    _id: string,
    title: string,
    description: string,
    color: { title: string, value: string }
}