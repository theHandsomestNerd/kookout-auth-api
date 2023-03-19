import {log} from "./logClient";
import sanityClient from "./sanityClient";
import {v4 as uuidv4} from "uuid";
import {createReadStream} from "fs";
import {SanityImageAssetDocument} from "@sanity/client";
import {SanityComment, SanityExtendedUserProfile, SanityFollow, SanityLike, SanityUser} from "../types";
import groqQueries from "./groqQueries";
import cmsUtils from "./cmsUtils";

const createUser = async (email: string, userId: string, provider: any) => {
    const LOG_COMPONENT = "create-user-"+userId

    const newSanityDocument = {
        _id: userId,
        _type: groqQueries.USER.type,
        email: email,
        userId: userId,
        displayName: provider.displayName || email,
        loginProviders: [{...provider, _key: uuidv4()}]
    }

    log(LOG_COMPONENT, "INFO", "Creating User", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create user", {email, userId, provider, e})
        return e
    })
}

enum LIKE_CATEGORY_ENUM {
    PROFILE_LIKE='profile-like'
}
const createProfileLike = async (likerUserId: string, likeeUserId: string) => {
    const LOG_COMPONENT = "create-profile-like-profile-"+likeeUserId+"-like-"+likeeUserId

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
const createProfileFollow = async (followerUserId: string, followedUserId: string) => {
    const LOG_COMPONENT = "create-profile-like-profile-"+followedUserId+"-like-"+followedUserId

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
    const LOG_COMPONENT = "remove-like-profile-"+likeId;

    log(LOG_COMPONENT, "INFO", "Removing Like", likeId)

    return sanityClient.delete(likeId).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not delete like", {likeId, e})
        return e
    })
}
const removeFollow = async (followId: string) => {
    const LOG_COMPONENT = "remove-follow-profile-"+followId;

    log(LOG_COMPONENT, "INFO", "Removing Follow", followId)

    return sanityClient.delete(followId).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not delete follow", {followId, e})
        return e
    })
}

const createReplaceExtendedProfile = async (userId: String, newProfile: SanityExtendedUserProfile) => {
    const LOG_COMPONENT = "create-replace-ext-profile-"+userId
    const newSanityDocument = {
        ...newProfile,
        _type: groqQueries.EXT_PROFILE.type,
    }

    log(LOG_COMPONENT, "INFO", "Creating an Extended Profile for " + userId, newSanityDocument)

    return sanityClient.createOrReplace(newSanityDocument,{returnDocuments:true}).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create or replace ext profile", {userId})
        return e
    })
}

const fetchUser = (userId: string): Promise<SanityUser | undefined> => {
    const LOG = "fetch-user"+userId

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
    const LOG = "fetch-profile-likes-"+userId

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
const fetchProfileFollows = (userId: string): Promise<SanityFollow[] | undefined> => {
    const LOG = "fetch-profile-likes-"+userId

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
const fetchProfileComments = (userId: string): Promise<SanityComment[] | undefined> => {
    const LOG = "fetch-profile-comment-"+userId

    return sanityClient
        .fetch(
            `*[_type == $thisType && recipient._ref == $userId ]| order(publishedAt asc){
          ${groqQueries.COMMENT.members}
       }`,
            {userId, thisType: groqQueries.COMMENT.type}
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


const fetchAllUsers = (): Promise<SanityUser[]> => {
    const LOG = "fetch-user"

    return sanityClient
        .fetch(
            `*[_type == $thisType]{
          ${groqQueries.USER.members}
       }`, {
                thisType: groqQueries.USER.type
            }
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
                log(LOG, "INFO",`No ext profile for user id: ${id}`)
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving ext profile for" + id
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving ext profile Error for id: ${id}: - ` + e.toString()))
            return Promise.resolve([]);
        })
}

const createProfileComment = async (commenterUserId: string, profileUserId: string, commentBody: string) => {
    const LOG_COMPONENT = "create-profile-comment-profile-"+profileUserId+"-comment-by-"+commenterUserId

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
    fetchProfileLikes,
    fetchProfileComments,
    removeLike,
    createProfileComment,
    createProfileFollow,
    removeFollow,
    fetchProfileFollows
};
