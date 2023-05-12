import {ImageAsset, Reference, Slug} from "@sanity/types";

export type SanityUser = {
    _id: string,
    displayName: string,
    email: string,
    username: string
}

export type SanityLikeRef = {
    _id: string,
    liker: Reference,
    likee: Reference,
    likeCategory: string
}
export type SanityLike = {
    _id: string,
    liker: SanityUser,
    likee: SanityUser,
    likeCategory: string
}
export type SanityTimelineEvent = {
    _id: string,
    actor: SanityUser,
    recipient: SanityUser,
    action: string
    isPublic: boolean
    item: SanityLike | SanityUser | SanityComment | SanityFollow
}
export type SanityBlockRef = {
    _id: string,
    blocker: Reference,
    blocked: Reference,
}
export type SanityBlock = {
    _id: string,
    blocker: SanityUser,
    blocked: SanityUser,
}

export type SanityFollowRef = {
    _id: string,
    follower: Reference,
    followed: Reference,
}

export type SanityFollow = {
    _id: string,
    follower: SanityUser,
    followed: SanityUser,
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
    shortBio: string,
    longBio: string,
    hashtags: string[],
}

export type SanityExtendedUserProfileRef = {
    _id: string,
    age: number,
    weight: number,
    height: Height,
    shortBio: string,
    longBio: string,
    spouse: string,
    children: string[],
    hashtags: string[],
}

export type SanityPost = {
    _id: string,
    title: string,
    slug: Slug,
    author: SanityUser,

    mainImage: ImageAsset,
    categories: SanityCategory[],
    publishedAt: Date,
    body: string,
}
export type SanityPostRef = {
    _type: string,
    _id: string,
    title: string,
    slug: Slug,
    author: Reference,

    mainImage: ImageAsset,
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
export type SanityPostComment = {
    _id: string,
    author: SanityUser,
    recipient: SanityPost,

    publishedAt: Date,
    body: string,
}
export type SanityCommentRef = {
    _id: string,
    author: Reference,
    recipient: Reference,

    publishedAt: Date,
    body: string,
}

export type SanityCategory = {
    _id: string,
    title: string,
    description: string,
    color: { title: string, value: string }
}
export type SanityPosition = {
    _id?: string
    longitude: string,
    latitude: string,
    timestamp: string,
    accuracy: string,
    altitude: string,
    heading: string,
    speed: string,
    speedAccuracy: string,
    floor: string,
}

export type UIHashtag = {
    start: number,
    end: number,
    text: string,
}

export type SanityHashTag = {
    tag:string,
    _id?:string
}

export type SanityHashTagRelationshipType = {
    hashtagRef:SanityHashTag,
    hashtaggedDocumentRef: SanityPost,
    _id?:string
}
export type SanitySpreadsheetRelationshipType = {
    spreadsheetMemberRef:SanityHashTag,
    userRef: SanityPost,
    isApproved: boolean,
    _id?:string
}
export type SanityHashtagCollectionType = {
    theTags:SanityHashTag[],
    name: string,
    description: string,
    slug: Slug,
    _id?:string
}

export type SanityCsvToProcess = {
    objectType?: string;
    description?: string;
    createdDocuments?: string[];
    csvFile?: any;
};