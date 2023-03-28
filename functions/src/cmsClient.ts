import {log} from "./logClient";
import sanityClient from "./sanityClient";
import {v4 as uuidv4} from "uuid";
import {createReadStream} from "fs";
import {SanityImageAssetDocument} from "@sanity/client";
import {
    SanityBlock,
    SanityBlockRef,
    SanityComment,
    SanityExtendedUserProfile, SanityExtendedUserProfileRef, SanityFollow,
    SanityLike,
    SanityLikeRef, SanityTimelineEvent,
    SanityUser
} from "../types";
import groqQueries from "./groqQueries";
import cmsUtils from "./cmsUtils";

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

enum LIKE_CATEGORY_ENUM {
    PROFILE_LIKE = 'profile-like'
}

const createProfileLike = async (likerUserId: string, likeeUserId: string): Promise<SanityLikeRef> => {
    const LOG_COMPONENT = "create-profile-like-profile-" + likeeUserId + "-like-" + likeeUserId

    const newSanityDocument = {
        _type: groqQueries.LIKE.type,
        liker: cmsUtils.getSanityDocumentRef(likerUserId),
        likee: cmsUtils.getSanityDocumentRef(likeeUserId),
        likeCategory: LIKE_CATEGORY_ENUM.PROFILE_LIKE
    }

    log(LOG_COMPONENT, "INFO", "Creating Like", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create like", {likerUserId, likeeUserId, e})
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
    const LOG_COMPONENT = "remove-like-profile-" + likeId;

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

const fetchProfileLikes = (userId: string): Promise<SanityLike[] | undefined> => {
    const LOG = "fetch-profile-likes-" + userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && likee._ref == $userId ]{
          ${groqQueries.LIKE.members}
       }`,
            {userId, thisType: groqQueries.LIKE.type}
        ).then((data: SanityLike[]) => {
            log(LOG, "NOTICE", "The raw Like", data)

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
const fetchProfileComments = (userId: string, blockedIds?: string[]): Promise<SanityComment[] | undefined> => {
    const LOG = "fetch-profile-comment-" + userId

    var queryString = "_type == $thisType && recipient._ref == $userId";
    var queryParams: any = {
        userId,
        thisType: groqQueries.COMMENT.type,
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
          ${groqQueries.COMMENT.members}
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
const fetchProfileTimelineEvents = (userId:string,blockedIds?: string[]): Promise<SanityTimelineEvent[]> => {
    const LOG = "fetch-profile-timeline-events-"+userId

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

const fetchExtendedProfile = (id: string): Promise<SanityExtendedUserProfile[]> => {
    const LOG = "fetch-extended-profile"
    var extProfileId = "ext-profile-" + id;

    return sanityClient
        .fetch(
            `*[_type == $theType && _id == $extProfileId]{
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
export default {
    createReplaceExtendedProfile,
    fetchExtendedProfile,
    createUser,
    uploadUserProfileImage,
    changeDisplayName,
    fetchUser,
    fetchAllUsers,
    createProfileLike,
    fetchProfileLike,
    createProfileBlock,
    fetchProfileLikes,
    // fetchProfileBlocks,
    fetchProfileComments,
    removeLike,
    createProfileComment,
    createProfileFollow,
    removeFollow,
    fetchProfileFollows,
    removeBlock,
    fetchMyProfileBlocks,
    fetchBiDirectionalProfileBlocks,
    fetchProfileTimelineEvents
};
