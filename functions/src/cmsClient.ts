import {log} from "./logClient";
import sanityClient from "./sanityClient";
import {v4 as uuidv4} from "uuid";
import {createReadStream} from "fs";
import {SanityImageAssetDocument} from "@sanity/client";
import {
    SanityBlock,
    SanityBlockRef,
    SanityComment,
    SanityExtendedUserProfile,
    SanityExtendedUserProfileRef,
    SanityFollow,
    SanityHashTag, SanityHashtagCollectionType,
    SanityHashTagRelationshipType,
    SanityLike,
    SanityLikeRef,
    SanityPosition,
    SanityPost,
    SanityPostComment,
    SanityPostRef, SanitySpreadsheetRelationshipType,
    SanityTimelineEvent,
    SanityUser
} from "../types";
import groqQueries from "./groqQueries";
import cmsUtils from "./cmsUtils";
import LIKE_CATEGORY_ENUM from "./LikeCategoryEnum";
import {CSVThetaChiMemberType} from "./csvClient";

const createUser = async (email: string, userId: string, provider: any) => {
    const LOG_COMPONENT = "create-user-" + userId

    const newSanityDocument = {
        _id: userId,
        _type: groqQueries.USER.type,
        email: email,
        userId: userId,
        displayName: provider.displayName || email.split('@')[0],
        loginProviders: [{...provider, _key: uuidv4()}]
    }

    log(LOG_COMPONENT, "INFO", "Creating User", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create user", {email, userId, provider, e})
        return e
    })
}


const createLike = async (likerUserId: string, likeeId: string, likeType: LIKE_CATEGORY_ENUM): Promise<SanityLikeRef> => {
    const LOG_COMPONENT = "create-profile-like-profile-" + likerUserId + "-like-" + likeeId

    const newSanityDocument = {
        _type: groqQueries.LIKE.type,
        liker: cmsUtils.getSanityDocumentRef(likerUserId),
        likee: cmsUtils.getSanityDocumentRef(likeeId),
        likeCategory: likeType
    }

    log(LOG_COMPONENT, "INFO", "Creating Like", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create like", {likerUserId, likeeUserId: likeeId, e})
        return e
    })
}
const createPosition = async (userId: string, position: SanityPosition): Promise<SanityPosition> => {
    const LOG_COMPONENT = "create-position-" + userId;

    const newSanityDocument = {
        _type: groqQueries.POSITION.type,
        userRef: cmsUtils.getSanityDocumentRef(userId),
        ...position
    }

    // log(LOG_COMPONENT, "DEBUG", "Creating Position", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create position", {userId, position, e})
        return e
    })
}
const createIfHashtagNotExist = async (hashtag: string): Promise<SanityHashTag> => {
    const LOG_COMPONENT = "create-hashtag?-" + hashtag;

    const newSanityDocument = {
        _type: groqQueries.HASH_TAG.type,
        _id: cmsUtils.convertToSlugStr(hashtag).replace('#', ''),
        slug: cmsUtils.convertToSlugObj(cmsUtils.convertToSlugStr(hashtag)),
        tag: hashtag,
    }

    log(LOG_COMPONENT, "INFO", "Creating Hashtag", newSanityDocument)

    return sanityClient.createIfNotExists(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create if hashtag didnt exist", {hashtag, e})
        return e
    })
}
const createHashtagRelationship = async (hashtag: SanityHashTag, documentId: string): Promise<SanityHashTagRelationshipType> => {
    const LOG_COMPONENT = "create-hashtag-relationship-" + hashtag.tag;

    const newSanityDocument = {
        _type: groqQueries.HASH_TAG_RELATIONSHIP.type,
        hashtagRef: cmsUtils.getSanityDocumentRef(cmsUtils.convertToSlugStr(hashtag.tag)),
        hashtaggedDocumentRef: cmsUtils.getSanityDocumentRef(documentId)
    }

    log(LOG_COMPONENT, "INFO", "Creating Hashtag Relationship", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create if hashtag relationship", {hashtag, e})
        return e
    })
}
const createProfileRosterRelation = async (userId: string, rosterId: string): Promise<SanitySpreadsheetRelationshipType> => {
    const LOG_COMPONENT = "create-roster-relationship-" + rosterId + "-"+ userId;

    const newSanityDocument = {
        _type: groqQueries.SPREADSHEET_RELATIONSHIP.type,
        userRef: cmsUtils.getSanityDocumentRef(userId),
        spreadsheetMemberRef: cmsUtils.getSanityDocumentRef(rosterId),
        isApproved: false
    }

    log(LOG_COMPONENT, "INFO", "Creating Profile roster Relationship", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create if profile roster relationship", {rosterId,userId, e})
        return e
    })
}
const createProfileBlock = async (blockerUserId: string, blockedUserId: string) => {
    const LOG_COMPONENT = "create-profile-block-profile-" + blockerUserId + "-blocked-" + blockedUserId

    const newSanityDocument = {
        _type: groqQueries.BLOCK.type,
        blocker: cmsUtils.getSanityDocumentRef(blockerUserId),
        blocked: cmsUtils.getSanityDocumentRef(blockedUserId),
    }

    log(LOG_COMPONENT, "INFO", "Creating Block", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create block", {blockerUserId, blockedUserId, e})
        return e
    })
}
const createProfileFollow = async (followerUserId: string, followedUserId: string) => {
    const LOG_COMPONENT = "create-profile-like-profile-" + followedUserId + "-like-" + followedUserId

    const newSanityDocument = {
        _type: groqQueries.FOLLOW.type,
        follower: cmsUtils.getSanityDocumentRef(followerUserId),
        followed: cmsUtils.getSanityDocumentRef(followedUserId),
    }

    log(LOG_COMPONENT, "INFO", "Creating Follow", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create follow", {followerUserId, followedUserId, e})
        return e
    })
}
const removeLike = async (likeId: string) => {
    const LOG_COMPONENT = "remove-like-" + likeId;

    log(LOG_COMPONENT, "INFO", "Removing Like", likeId)

    return sanityClient.delete(likeId).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not delete like", {likeId, e})
        return e
    })
}
const removeBlock = async (blockId: string) => {
    const LOG_COMPONENT = "remove-block-profile-" + blockId;

    log(LOG_COMPONENT, "INFO", "Removing Block", blockId)

    return sanityClient.delete(blockId).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not delete block", {blockId, e})
        return e
    })
}
const removeFollow = async (followId: string) => {
    const LOG_COMPONENT = "remove-follow-profile-" + followId;

    log(LOG_COMPONENT, "INFO", "Removing Follow", followId)

    return sanityClient.delete(followId).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not delete follow", {followId, e})
        return e
    })
}

const createReplaceExtendedProfile = async (userId: String, newProfile: SanityExtendedUserProfileRef) => {
    const LOG_COMPONENT = "create-replace-ext-profile-" + userId
    const newSanityDocument = {
        ...newProfile,
        _type: groqQueries.EXT_PROFILE.type,
    }

    log(LOG_COMPONENT, "INFO", "Creating an Extended Profile for " + userId, newSanityDocument)

    return sanityClient.createOrReplace(newSanityDocument, {returnDocuments: true}).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create or replace ext profile", {userId})
        return e
    })
}

const fetchUser = (userId: string): Promise<SanityUser | undefined> => {
    const LOG = "fetch-user" + userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && userId == $userId]{
          ${groqQueries.USER.members}
       }`,
            {userId, thisType: groqQueries.USER.type}
        ).then((data: SanityUser[]) => {
            log(LOG, "NOTICE", "The user raw", data)

            if (!data[0]) {
                console.log(Error(`Error retrieving user no user returned for ${userId}: `))
            }

            return data[0]
        }).catch((e: any) => {
            const error = "Error retrieving User"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving User Error: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}
const fetchPost = (postId: string): Promise<SanityPost | undefined> => {
    const LOG = "fetch-post-" + postId

    return sanityClient
        .fetch(
            `*[_type == $thisType && _id == $postId]{
          ${groqQueries.POST.members}
       }`,
            {postId, thisType: groqQueries.POST.type}
        ).then((data: SanityPost[]) => {
            log(LOG, "NOTICE", "The post raw", data)

            if (!data[0]) {
                console.log(Error(`Error retrieving post no post returned for ${postId}: `))
            }

            return data[0]
        }).catch((e: any) => {
            const error = "Error retrieving post"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving post Error: ${postId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}
const fetchHashtagCollection = (hashtagCollectionSlug: string): Promise<SanityPost | undefined> => {
    const LOG = "fetch-hashtag-collection-" + hashtagCollectionSlug

    return sanityClient
        .fetch(
            `*[_type == $thisType && slug.current == $hashtagCollectionSlug]{
          ${groqQueries.HASH_TAG_COLLECTION.members}
       }`,
            {hashtagCollectionSlug: hashtagCollectionSlug, thisType: groqQueries.HASH_TAG_COLLECTION.type}
        ).then((data: SanityHashtagCollectionType[]) => {
            log(LOG, "NOTICE", "The hashtag collection type raw", data)

            if (!data[0]) {
                console.log(Error(`Error retrieving hashtag collection no collection returned for slug ${hashtagCollectionSlug}: `))
            }

            return data[0]
        }).catch((e: any) => {
            const error = "Error retrieving hashtag collection"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving hashtag collection Error: slug ${hashtagCollectionSlug} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}


const fetchChapterRoster = (): Promise<CSVThetaChiMemberType[] | undefined> => {
    const LOG = "fetch-chapter-roster"

    return sanityClient
        .fetch(
            `*[_type == $thisType]{
          ...
       }`,
            {thisType: groqQueries.SPREADSHEET_MEMBER.type}
        ).then((data: CSVThetaChiMemberType[]) => {
            log(LOG, "NOTICE", "The chapter roster raw", data)

            if (!data[0]) {
                console.log(Error(`Error retrieving chapter roster`))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving chapter roster"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(error + e.toString()))
            return Promise.resolve(undefined);
        })
}

const fetchProfileLikes = (userId: string): Promise<SanityLike[] | undefined> => {
    const LOG = "fetch-profile-likes-" + userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && likee._ref == $userId ]{
          ${groqQueries.LIKE.members}
       }`,
            {userId, thisType: groqQueries.LIKE.type}
        ).then((data: SanityLike[]) => {
            log(LOG, "NOTICE", "The raw Likes", data.length)

            return data
        }).catch((e: any) => {
            const error = "Error retrieving Likes"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving User Likes: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}
// const fetchProfileBlocks = (userId: string): Promise<SanityBlockRef[] | undefined> => {
//     const LOG = "fetch-profile-blocks-" + userId
//
//     return sanityClient
//         .fetch(
//             `*[_type == $thisType && blocked._ref == $userId ]{
//           ${groqQueries.BLOCK.members}
//        }`,
//             {userId, thisType: groqQueries.BLOCK.type}
//         ).then((data: SanityLikeRef[]) => {
//             log(LOG, "NOTICE", "The raw blocks", data)
//
//             return data
//         }).catch((e: any) => {
//             const error = "Error retrieving Blocks"
//             log(LOG, "ERROR", error, {error: e})
//             console.log(Error(`Error retrieving User Blocks: ${userId} - ` + e.toString()))
//             return Promise.resolve(undefined);
//         })
// }
const fetchMyProfileBlocks = (userId: string): Promise<SanityBlockRef[] | undefined> => {
    const LOG = "fetch-my-profile-blocks-" + userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && blocker._ref == $userId ]{
          ${groqQueries.BLOCK.members}
       }`,
            {userId, thisType: groqQueries.BLOCK.type}
        ).then((data: SanityBlockRef[]) => {
            log(LOG, "NOTICE", "The raw my blocks", data)

            return data
        }).catch((e: any) => {
            const error = "Error retrieving My user's Blocks"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving My User's Blocks: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}

const fetchBiDirectionalProfileBlocks = (userId: string): Promise<SanityBlock[] | undefined> => {
    const LOG = "fetch-my-bidirectional-profile-blocks-" + userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && references($userId) ]{
          ${groqQueries.BLOCK.members}
       }`,
            {userId, thisType: groqQueries.BLOCK.type}
        ).then((data: SanityBlockRef[]) => {
            log(LOG, "NOTICE", "The raw my bidirectional blocks", data)

            return data
        }).catch((e: any) => {
            const error = "Error retrieving My user's bidirectional Blocks"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving My User's bidirectional  Blocks: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}
const fetchProfileFollows = (userId: string): Promise<SanityFollow[] | undefined> => {
    const LOG = "fetch-profile-likes-" + userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && followed._ref == $userId ]{
          ${groqQueries.FOLLOW.members}
       }`,
            {userId, thisType: groqQueries.FOLLOW.type}
        ).then((data: SanityFollow[]) => {
            log(LOG, "NOTICE", "The raw Follow", data)

            return data
        }).catch((e: any) => {
            const error = "Error retrieving Follows"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving User Follows: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}
const fetchProfileComments = (typeId: string, userId: string, blockedIds?: string[]): Promise<SanityComment[] | undefined> => {
    const LOG = `fetch-${typeId}s-` + userId

    var queryString = "_type == $thisType && recipient._ref == $userId";
    var queryParams: any = {
        userId,
        thisType: typeId == 'profile-comment' ? groqQueries.COMMENT.type : groqQueries.POST_COMMENT.type,
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "NOTICE", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(author._ref in $blockedIds) && !(recipient._ref in $blockedIds)"
    }
    log(LOG, "Notice", `All comments Query:`, {queryString, queryParams})


    return sanityClient
        .fetch(
            `*[${queryString}]| order(publishedAt asc){
          ${typeId == 'profile-comment' ? groqQueries.COMMENT.members : groqQueries.POST_COMMENT.members}
       }`,
            queryParams
        ).then((data: SanityComment[]) => {
            log(LOG, "NOTICE", "The raw Comments", data)

            return data
        }).catch((e: any) => {
            const error = "Error retrieving Comments"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving Profile Comments: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}
const fetchPosts = (blockedIds?: string[]): Promise<SanityPost[] | undefined> => {
    const LOG = "fetch-posts-"

    var queryString = "_type == $thisType";
    var queryParams: any = {
        thisType: groqQueries.POST.type,
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "NOTICE", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(author._ref in $blockedIds)"
    }
    log(LOG, "Notice", `All posts Query:`, {queryString, queryParams})


    return sanityClient
        .fetch(
            `*[${queryString}]| order(publishedAt asc){
          ${groqQueries.POST.members}
       }`,
            queryParams
        ).then((data: SanityPost[]) => {
            log(LOG, "NOTICE", "The raw Posts", data.length)

            return data
        }).catch((e: any) => {
            const error = "Error retrieving Posts"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving Profile Posts: - ` + e.toString()))
            return Promise.resolve(undefined);
        })
}

const uploadUserProfileImage = async (filePath: any, userId: string): Promise<SanityImageAssetDocument> => {
    return sanityClient.assets.upload("image", createReadStream(filePath) as unknown as Blob,
        {filename: `${userId}-profile-photo`})
        .then(async (imageAsset: SanityImageAssetDocument) => {
            console.log("The Image Asset uploaded", imageAsset)
            const btUser = await fetchUser(userId)
            await sanityClient
                .patch(btUser?._id ?? "no-id")
                .set({
                    profileImage: {
                        _type: "image",
                        asset: {
                            _type: "reference",
                            _ref: imageAsset._id
                        }
                    }
                })
                .commit()

            return imageAsset
        })
        .catch((e: any) => {
            return Promise.reject(Error(`Error uploading user profile image asset to sanity for user ${userId} Error: ` + e.toString()))
        })
}
const uploadUserPost = async (filePath?: any, userId?: string, postBody?: string):Promise<SanityPostRef|null> =>
{
    const LOG_COMPONENT = "upload-user-post-image-" + userId

    var imageAsset

    if (filePath != null) {
        try {

            imageAsset = await sanityClient.assets.upload("image", createReadStream(filePath) as unknown as Blob,
                {filename: `${userId}-post-photo`})
            log(LOG_COMPONENT, "NOTICE", "The post Image Asset uploaded", {imageAsset})
        } catch (e) {
            log(LOG_COMPONENT, "ERROR", "The image could not be created in sanity aborting post creation", {e})

            return null;
        }
    }
    log(LOG_COMPONENT, "NOTICE", "The post body", {postBody})

    var newSanityDocument = {
        _type: groqQueries.POST.type,
        author: cmsUtils.getSanityDocumentRef(userId ?? ""),
        body: postBody,
        publishedAt: new Date(Date.now()),
    }

    if (imageAsset != null && imageAsset._id != null) {
        newSanityDocument = {
            ...newSanityDocument,
            mainImage: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id
                }
            },
        } as any;
    }

    log(LOG_COMPONENT, "INFO", "Creating Post", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create post", { userId, postBody, e})
        return null
    })
}
const uploadBugReport = async (filePath?: any, userId?: string, title?: string, description?: string, uiVersion?: string, apiVersion?: string, uiSanityDB?: string, apiSanityDB?: string): Promise<SanityPostRef> => {
    const LOG_COMPONENT = "upload-bug-report-image-" + userId

    var imageAsset

    var slug = cmsUtils.convertToSlugStr(title ?? "");
    if (filePath != null) {
        imageAsset = await sanityClient.assets.upload("image", createReadStream(filePath) as unknown as Blob,
            {filename: `${slug}-bug-report`})


        log(LOG_COMPONENT, "NOTICE", "The bug report Image Asset uploaded", {imageAsset})

    }
    log(LOG_COMPONENT, "NOTICE", "The title and body", {title, description})

    var newSanityDocument: any = {
        _type: groqQueries.BUG_REPORT.type,
        body: description,
        title, uiVersion, apiVersion, uiSanityDB, apiSanityDB,
        slug: cmsUtils.convertToSlugObj(slug ?? ""),
        publishedAt: new Date(Date.now()),
    }

    if (userId && userId != "") {
        newSanityDocument = {
            ...newSanityDocument, submittedBy: cmsUtils.getSanityDocumentRef(userId ?? ""),
        }
    }

    if (imageAsset != null && imageAsset._id != null) {
        newSanityDocument = {
            ...newSanityDocument,
            mainImage: {
                _type: "image",
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id
                }
            },
        } as any;
    }

    log(LOG_COMPONENT, "INFO", "Creating Bug Report", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create bug report", {userId, title, description})
        return e
    })


}

const changeDisplayName = (displayName: string, firebaseUid: string) => {
    const LOG = `change-displayname-${firebaseUid}`;

    if (!firebaseUid) {
        return Promise.reject("no sanity uuid to update displayname to " + displayName + firebaseUid)
    }

    return sanityClient
        .patch(firebaseUid)
        .set({displayName: displayName})
        .commit()
        .catch((e: any) => {
            console.log(LOG, "error: ", e)
            return Promise.reject(e)
        })

}


const fetchAllUsers = (blockedIds?: string[]): Promise<SanityUser[]> => {
    const LOG = "fetch-user"

    var queryString = "_type == $thisType";
    var queryParams: any = {
        thisType: groqQueries.USER.type,
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "NOTICE", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(userId in $blockedIds)"
    }
    log(LOG, "Notice", `All users Query:`, {queryString, queryParams})

    return sanityClient
        .fetch(
            `*[${queryString}]{
          ${groqQueries.USER.members}
       }`, queryParams
        ).then((data: SanityUser[]) => {
            // log(LOG, "NOTICE", "The users raw", data)

            if (!data) {
                console.log(Error(`Error retrieving users: `))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving Users"
            log(LOG, "ERROR", error, {error: e})
            // console.log(Error(`Error retrieving Users Error: - ` + e.toString()))
            return Promise.resolve([]);
        })
}
const fetchAllSpreadsheetRelations = (): Promise<SanitySpreadsheetRelationshipType[]> => {
    const LOG = "fetch-all-spreadsheet-relations"

    var queryString = "_type == $thisType";
    var queryParams: any = {
        thisType: groqQueries.SPREADSHEET_RELATIONSHIP.type,
    }

    log(LOG, "Notice", `All spreadsheet relations Query:`, {queryString, queryParams})

    return sanityClient
        .fetch(
            `*[${queryString}]{
          ${groqQueries.SPREADSHEET_RELATIONSHIP.members}
       }`, queryParams
        ).then((data: SanitySpreadsheetRelationshipType[]) => {
            // log(LOG, "NOTICE", "The users raw", data)

            if (!data) {
                console.log(Error(`Error retrieving spreadsheet member relations`))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving spreadsheet member relations"
            log(LOG, "ERROR", error, {error: e})
            // console.log(Error(`Error retrieving Users Error: - ` + e.toString()))
            return Promise.resolve([]);
        })
}
const fetchAllUsersPaginated = (pageSize: number, theLastId?: string, blockedIds?: string[]): Promise<SanityUser[]> => {
    const LOG = `fetch-users-paginated-start-at-${theLastId}-${pageSize}`

    var lastId: (string | null) = theLastId ?? null
    var queryString = "_type == $thisType"
    var queryParams: any = {
        thisType: groqQueries.USER.type,
        // pageSize: pageSize,
    }

    if (lastId != null && lastId != "") {
        queryString += " && _id > $lastId"
        queryParams = {...queryParams, lastId}
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "DEBUG", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(userId in $blockedIds)"
    }

    log(LOG, "DEBUG", `All users Query paginated starting at ${lastId}:`, {queryString, queryParams})


    return sanityClient
        .fetch(
            `*[${queryString}][0...${pageSize}]{
          ${groqQueries.USER.members}
       }`, {...queryParams}
        ).then((data: SanityUser[]) => {
            // log(LOG, "NOTICE", "The users raw", data)

            if (!data) {
                console.log(Error(`Error retrieving paginated users: page=${pageSize} lastId=${lastId} `))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving paginated Users"
            log(LOG, "ERROR", error, {error: e})
            return Promise.resolve([]);
        })
}
const fetchAllPostsPaginated = (pageSize: number, theLastId?: string, blockedIds?: string[]): Promise<SanityPost[]> => {
    const LOG = `fetch-posts-paginated-start-at-${theLastId}-${pageSize}`

    var lastId: (string | null) = theLastId ?? null
    var queryString = "_type == $thisType"
    var queryParams: any = {
        thisType: groqQueries.POST.type,
        // pageSize: pageSize,
    }

    if (lastId != null && lastId != "") {
        queryString += " && _id > $lastId"
        queryParams = {...queryParams, lastId}
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "DEBUG", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(userId in $blockedIds)"
    }

    log(LOG, "DEBUG", `All posts Query paginated starting at ${lastId}:`, {queryString, queryParams})


    return sanityClient
        .fetch(
            `*[${queryString}] | order(_id asc,_createdAt asc)[0...${pageSize}]{
          ${groqQueries.POST.members}
       }`, {...queryParams}
        ).then((data: SanityPost[]) => {
            // log(LOG, "NOTICE", "The users raw", data)
            if (data) {
                data.forEach((element) => {
                    log(LOG, "DEBUG", element.publishedAt.toString());
                })
            }

            if (!data) {
                console.log(Error(`Error retrieving paginated posts: page=${pageSize} lastId=${lastId} `))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving paginated Posts"
            log(LOG, "ERROR", error, {error: e})
            return Promise.resolve([]);
        })
}

const fetchHashtaggedPostsPaginated = (hashtagId: string, pageSize: string, theLastId?: string, blockedIds?: string[]): Promise<SanityPost[]> => {
    const LOG = `fetch-#${hashtagId}-hashtagged-posts-paginated-start-at-${theLastId}-${pageSize}`

    var lastId: (string | null) = theLastId ?? null
    var queryString = "_type == $thisType && hashtagRef->slug.current == $slug"
    var queryParams: any = {
        thisType: groqQueries.HASH_TAG_RELATIONSHIP.type,
        hashtagId: cmsUtils.convertToSlugStr(hashtagId),
        slug: cmsUtils.convertToSlugStr(hashtagId)
        // pageSize: pageSize,
    }

    if (lastId != null && lastId != "") {
        queryString += " && _id > $lastId"
        queryParams = {...queryParams, lastId}
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "DEBUG", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(hashtaggedDocumentRef.author._id in $blockedIds)"
    }

    log(LOG, "DEBUG", `Hashtagged posts Query paginated starting at ${lastId}:`, {queryString, queryParams})


    return sanityClient
        .fetch(
            `*[${queryString}] | order(_createdAt desc)[0...${pageSize}]{
          hashtaggedDocumentRef->
       }`, {...queryParams}
        ).then((data: SanityHashTagRelationshipType[]) => {
            // log(LOG, "NOTICE", "The hashtagged posts raw", data)
            // if(data){
            //     data.forEach((element)=>{
            //         log(LOG, "DEBUG", element.hashtaggedDocumentRef.publishedAt.toString());
            //     })
            // }

            if (!data) {
                console.log(Error(`Error retrieving hashtagged paginated posts: hashtag=${hashtagId} page=${pageSize} lastId=${lastId} `))
            }

            return data.map((hashtagRelation) => {
                return hashtagRelation.hashtaggedDocumentRef;
            })
        }).catch((e: any) => {
            const error = "Error retrieving paginated Posts"
            log(LOG, "ERROR", error, {error: e})
            return Promise.resolve([]);
        })
}
const fetchPostCommentsPaginated = (documentId: string, pageSize: number, theLastId?: string, blockedIds?: string[]): Promise<SanityPostComment[]> => {
    const LOG = `fetch-post-${documentId}-comments-paginated-start-at-${theLastId}-${pageSize}`

    var lastId: (string | null) = theLastId ?? null
    var queryString = "_type == $thisType && references($documentId)"
    var queryParams: any = {
        thisType: groqQueries.POST_COMMENT.type,
        documentId: documentId
        // pageSize: pageSize,
    }

    if (lastId != null && lastId != "") {
        queryString += " && _id > $lastId"
        queryParams = {...queryParams, lastId}
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "DEBUG", "I have blocked these users", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !(userId in $blockedIds)"
    }

    log(LOG, "DEBUG", `post comments paginated Query paginated starting at ${lastId}:`, {queryString, queryParams})


    return sanityClient
        .fetch(
            `*[${queryString}][0...${pageSize}]|order(publishedAt){
          ${groqQueries.POST_COMMENT.members}
       }`, {...queryParams}
        ).then((data: SanityPostComment[]) => {
            // log(LOG, "NOTICE", "The users raw", data)

            if (!data) {
                console.log(Error(`Error retrieving paginated post:${documentId} comments: page=${pageSize} lastId=${lastId} `))
            }

            return data
        }).catch((e: any) => {
            const error = `Error retrieving paginated ${documentId} Post comments: page=${pageSize} lastId=${lastId} `
            log(LOG, "ERROR", error, {error: e})
            return Promise.resolve([]);
        })
}
const fetchProfileTimelineEvents = (userId: string, blockedIds?: string[]): Promise<SanityTimelineEvent[]> => {
    const LOG = "fetch-profile-timeline-events-" + userId

    var queryString = "_type == $thisType && ((actor._ref != $userId && isPublic == true) || (recipient._ref == $userId && isPublic==false))";
    var queryParams: any = {
        thisType: groqQueries.TIMELINE_EVENT.type,
        userId: userId
    }

    if (blockedIds && blockedIds.length > 0) {
        log(LOG, "NOTICE", "I have blocked these users so will not include them in timeline", blockedIds)
        queryParams = {...queryParams, blockedIds: blockedIds}
        queryString += " && !references($blockedIds)"
    }

    log(LOG, "NOTICE", "TImeline query string", {queryString, queryParams})

    return sanityClient
        .fetch(
            `*[${queryString}]{
          ${groqQueries.TIMELINE_EVENT.members}
       }`, queryParams
        ).then((data: SanityTimelineEvent[]) => {
            // log(LOG, "NOTICE", "The users raw", data)

            if (!data) {
                console.log(Error(`Error retrieving timeline events: `))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving timeline events"
            log(LOG, "ERROR", error, {error: e})
            // console.log(Error(`Error retrieving Users Error: - ` + e.toString()))
            return Promise.resolve([]);
        })
}
const fetchProfileTimelineEventsRef = (referenceId: string): Promise<SanityTimelineEvent[]> => {
    const LOG = "fetch-profile-timeline-events-refs-" + referenceId

    var queryString = "_type == $thisType && references($referenceId)";
    var queryParams: any = {
        thisType: groqQueries.TIMELINE_EVENT.type,
        referenceId,
    }

    log(LOG, "NOTICE", "TImeline refs query string", {queryString, queryParams})

    return sanityClient
        .delete({
            query: `*[_type == '${groqQueries.TIMELINE_EVENT.type}' && references('${referenceId}')][0...999]`
        }).then((data: any) => {
            log(LOG, "NOTICE", "The timeline event refs raw", data)

            if (!data) {
                console.log(Error(`Error retrieving timeline events: `))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving timeline events"
            log(LOG, "ERROR", error, {error: e})
            // console.log(Error(`Error retrieving timeline events Error: - ` + e.toString()))
            return Promise.resolve([]);
        })
}

const fetchExtendedProfile = (id: string): Promise<SanityExtendedUserProfile[]> => {
    const LOG = "fetch-extended-profile"
    var extProfileId = id;

    return sanityClient
        .fetch(
            `*[_type == $theType && references($extProfileId)]{
          ${groqQueries.EXT_PROFILE.members}
       }`, {
                extProfileId,
                theType: groqQueries.EXT_PROFILE.type
            }
        ).then((data: SanityExtendedUserProfile[]) => {
            log(LOG, "NOTICE", "THe ext profile raw", data)

            if (!data[0]) {
                log(LOG, "INFO", `No ext profile for user id: ${id}`)
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving ext profile for" + id
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving ext profile Error for id: ${id}: - ` + e.toString()))
            return Promise.resolve([]);
        })
}
const fetchPosition = (id: string): Promise<SanityPosition> => {
    const LOG = "fetch-position"
    var userId = id;

    return sanityClient
        .fetch(
            `*[_type == $theType && references($userId)] | order(_createdAt desc)[0]{
                ${groqQueries.POSITION.members}
            }`, {
                userId: userId,
                theType: groqQueries.POSITION.type
            }
        ).then((data: SanityPosition) => {
            log(LOG, "NOTICE", "THe position raw", data)

            if (!data) {
                log(LOG, "INFO", `No position for user id: ${id}`)
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving position for" + id
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving position Error for id: ${id}: - ` + e.toString()))
            return Promise.resolve([]);
        })
}

const fetchProfileLike = (likeId: string): Promise<SanityLike> => {
    const LOG = "fetch-profile-like-" + likeId

    return sanityClient
        .fetch(
            `*[_type == $theType && _id == $likeId]{
          ${groqQueries.LIKE.members}
       }`, {
                likeId: likeId,
                theType: groqQueries.LIKE.type
            }
        ).then((data: SanityLike[]) => {
            log(LOG, "NOTICE", "THe like raw", data)

            if (!data[0]) {
                log(LOG, "INFO", `No like for id: ${likeId}`)
            }

            return data[0]
        }).catch((e: any) => {
            const error = "Error retrieving like for" + likeId
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving like Error for id: ${likeId}: - ` + e.toString()))
            return Promise.resolve([]);
        })
}
const fetchProfileFollow = (followId: string): Promise<SanityFollow> => {
    const LOG = "fetch-profile-follow-" + followId

    return sanityClient
        .fetch(
            `*[_type == $theType && _id == $followId]{
          ${groqQueries.FOLLOW.members}
       }`, {
                followId: followId,
                theType: groqQueries.FOLLOW.type
            }
        ).then((data: SanityFollow[]) => {
            log(LOG, "NOTICE", "THe follow raw", data)

            if (!data[0]) {
                log(LOG, "INFO", `No follow for id: ${followId}`)
            }

            return data[0]
        }).catch((e: any) => {
            const error = "Error retrieving follow for" + followId
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving follow Error for id: ${followId}: - ` + e.toString()))
            return Promise.resolve([]);
        })
}

const createProfileComment = async (commenterUserId: string, profileUserId: string, commentBody: string) => {
    const LOG_COMPONENT = "create-profile-comment-profile-" + profileUserId + "-comment-by-" + commenterUserId

    const newSanityDocument = {
        _type: groqQueries.COMMENT.type,
        author: cmsUtils.getSanityDocumentRef(commenterUserId),
        recipient: cmsUtils.getSanityDocumentRef(profileUserId),
        publishedAt: new Date(Date.now()),
        body: commentBody
    }

    log(LOG_COMPONENT, "INFO", "Creating Comment", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create comment", {commenterUserId, profileUserId, commentBody, e})
        return e
    })
}
const createPostComment = async (commenterUserId: string, profileUserId: string, commentBody: string) => {
    const LOG_COMPONENT = "create-post-comment-profile-" + profileUserId + "-comment-by-" + commenterUserId

    const newSanityDocument = {
        _type: groqQueries.POST_COMMENT.type,
        author: cmsUtils.getSanityDocumentRef(commenterUserId),
        recipient: cmsUtils.getSanityDocumentRef(profileUserId),
        publishedAt: new Date(Date.now()),
        body: commentBody
    }

    log(LOG_COMPONENT, "INFO", "Creating Post COmment", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create post comment", {commenterUserId, profileUserId, commentBody, e})
        return e
    })
}

const createCommentThread = async (postId: string,) => {
    const LOG_COMPONENT = "create-comment-thread-";

    const newSanityDocument = {
        _type: groqQueries.COMMENT_THREAD.type,
        sourceOfCommentThread: cmsUtils.getSanityDocumentRef(postId),
    }

    log(LOG_COMPONENT, "INFO", "Creating Comment Thread ", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create comment thread", {postId, e})
        return e
    })
}

const createSanityDocument = async (document: CSVThetaChiMemberType, sanityType: string) => {
    const newSanityDocument = {
        _type: sanityType,
        isAutoGenerated: true,
        ...document,
        slug: cmsUtils.convertToSlugObj(document.spreadsheetId.toString()),
    };

    log("createSanityItemDocument", "NOTICE", "processing sanity document", document);
    log("createSanityItemDocument", "NOTICE", "processing sanity document", newSanityDocument);

    if (!sanityType) {
        log("createSanityItemDocument", "ERROR", "Can't process this document", {document, sanityType});

        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject();
    }

    const foundItem: any = await sanityClient
        .fetch(
            "*[_type == $type && slug.current == $slug]", {
                slug: document.spreadsheetId,
                type: sanityType
            }).then((data: any[]) => data[0]);

    if (foundItem) {
        log("createSanityItemDoc", "NOTICE", "updating document with slug: ", {
            foundItem,
            slug: document.slug,
            type: sanityType,
            potentialDocument: newSanityDocument
        });

        return sanityClient.patch(foundItem._id).set({
            ...newSanityDocument,
        }).commit();
    } else {
        log("createSanityItemDoc", "NOTICE", "creating document with slug ", newSanityDocument);

        return sanityClient.create({
            ...newSanityDocument,
        });
    }
};

export default {
    fetchAllSpreadsheetRelations,
    createProfileRosterRelation,
    fetchHashtaggedPostsPaginated,
    createHashtagRelationship,
    createIfHashtagNotExist,
    createCommentThread,
    createReplaceExtendedProfile,
    fetchExtendedProfile,
    createUser,
    fetchPosition,
    uploadUserProfileImage,
    uploadUserPost,
    uploadBugReport,
    changeDisplayName,
    fetchUser,
    fetchPost,
    createPosition,
    fetchAllUsers,
    fetchAllUsersPaginated,
    fetchAllPostsPaginated,
    fetchPostCommentsPaginated,
    createLike,
    fetchProfileLike,
    createProfileBlock,
    fetchProfileLikes,
    createPostComment,
    fetchProfileComments,
    fetchPosts,
    removeLike,
    createProfileComment,
    createProfileFollow,
    removeFollow,
    fetchProfileFollows,
    fetchProfileFollow,
    removeBlock,
    fetchMyProfileBlocks,
    fetchBiDirectionalProfileBlocks,
    fetchProfileTimelineEvents,
    fetchProfileTimelineEventsRef,
    fetchHashtagCollection,
    fetchChapterRoster,
    createSanityDocument
};
