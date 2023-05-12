import * as logClient from "./logClient";
import cmsClient from "./cmsClient";
import authService from "./authService";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import {Height, SanityPosition} from "../types";
import cmsService from "./cmsService";
import cmsUtils from "./cmsUtils";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import LIKE_CATEGORY_ENUM from "./LikeCategoryEnum";
import CommentCategoryEnum from "./CommentCategoryEnum";

const getExtendedProfile = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `fetch-ext-profile-for-user-${id}`

    logClient.log(LOG_COMPONENT, "NOTICE",
        "Get Extended Profile Request", req.params)
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in fetch ext profile req", id)

        return res.send({status: "404", message: "no id present in url for ext profile request"})
    }

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "No valid user from this Access Token");
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const extProfile = await cmsClient.fetchExtendedProfile(id);

            const response = extProfile.length == 1 ? extProfile[0] : null
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "Ext Profile Resp:", response);

            if (extProfile.length == 0) {
                logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                    "Delivering 400:", response);
                return res.status(200).send({noExtendedProfile: "No Ext profile", userId: whoami.uid});
            }

            return res.status(200).send({extendedProfile: response ?? "No Extended Profile"});
        }
    }
}
const getPosition = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `fetch-position-for-user-${id}`

    logClient.log(LOG_COMPONENT, "NOTICE",
        "Get user Position Request", req.params)
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in fetch ext profile req", id)

        return res.send({status: "404", message: "no id present in url for ext profile request"})
    }

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "No valid user from this Access Token");
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const thePosition = await cmsClient.fetchPosition(id);

            const response = thePosition
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "position Resp:", response);

            if (thePosition == null) {
                logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                    "Delivering 400:", response);
                return res.status(200).send({noPosition: "No position found", userId: id});
            }

            return res.status(200).send({lastPosition: response ?? "No Position foound"});
        }
    }
}


const getAllProfiles = async (req: any, res: any) => {
    const LOG_COMPONENT = 'get-all-profiles';
    logClient.log(LOG_COMPONENT, "DEBUG",
        "Getting All Profiles");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const allUsers = await cmsService.fetchAllUsers(whoami.uid);

            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "num GET all profiles RESULTS", allUsers.length);

            return res.send({profiles: [...allUsers]});
        }
    }


}

const getAllProfilesPaginated = async (req: any, res: any) => {
    var {lastId, pageSize} = req.params;
    const LOG_COMPONENT = `get-all-profiles-paginated-${lastId}-${pageSize}`;
    logClient.log(LOG_COMPONENT, "DEBUG",
        "Getting All Profiles - paginated");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const thisUserPaginated = await cmsService.fetchAllUsersPaginated(whoami.uid, pageSize, lastId,);

            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "num GET all profiles paginated RESULTS", thisUserPaginated.length);
            var nextLastId;
            if (thisUserPaginated.length > 0) {
                nextLastId = thisUserPaginated[thisUserPaginated.length - 1]._id
            } else {
                nextLastId = null // Reached the end
            }

            return res.send({profiles: [...thisUserPaginated], lastId: nextLastId});
        }
    }


}
const getAllPostsPaginated = async (req: any, res: any) => {
    var {lastId, pageSize} = req.params;
    const LOG_COMPONENT = `get-all-posts-paginated-${lastId}-${pageSize}`;
    logClient.log(LOG_COMPONENT, "DEBUG",
        "Getting All Posts - paginated");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const thePageOfPostsFromDb = await cmsService.fetchAllPostsPaginated(whoami.uid, pageSize, lastId,);

            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "num GET all posts paginated RESULTS", thePageOfPostsFromDb.length);
            var nextLastId;
            if (thePageOfPostsFromDb.length >= pageSize) {
                nextLastId = thePageOfPostsFromDb[thePageOfPostsFromDb.length - 1]._id
            } else {
                nextLastId = null // Reached the end
            }

            return res.send({posts: [...thePageOfPostsFromDb], lastId: nextLastId});
        }
    }


}

const getCommentThreadPaginated = async (req: any, res: any) => {
    var {lastId, pageSize, documentId} = req.params;
    const LOG_COMPONENT = `get-${documentId}-comment-thread-comments-paginated-${pageSize}-${lastId}`;
    logClient.log(LOG_COMPONENT, "DEBUG",
        "Getting paginated comments from  for doc - paginated");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const thePageOfPostCommentsFromDb = await cmsService.fetchPostCommentsPaginated(whoami.uid, documentId, pageSize, lastId,);

            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "num GET post comments paginated RESULTS", thePageOfPostCommentsFromDb.length);
            var nextLastId;
            if (thePageOfPostCommentsFromDb.length > 0) {
                nextLastId = thePageOfPostCommentsFromDb[thePageOfPostCommentsFromDb.length - 1]._id
            } else {
                nextLastId = null // Reached the end
            }

            return res.send({comments: [...thePageOfPostCommentsFromDb], lastId: nextLastId});
        }
    }


}


const getProfileById = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `fetch-profile-for-user-${id}`
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in fetch profile req", id)

        return res.send({status: "404", message: "no id present in url for profile request"})
    }

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const aProfile = await cmsClient.fetchUser(id);
            logClient.log(LOG_COMPONENT, "NOTICE",
                "GET USER by id RESULT", aProfile);
            return res.send({appProfile: aProfile});
        }
    }
}
const getPostById = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `fetch-post-for-id-${id}`
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no post id in fetch posts by id req", id)

        return res.send({status: "404", message: "no post id present in url for post request"})
    }

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const aPost = await cmsClient.fetchPost(id);
            logClient.log(LOG_COMPONENT, "NOTICE",
                "GET Post by id RESULT", aPost);
            return res.send({post: aPost});
        }
    }
}
const getHashtagCollectionBySlug = async (req: any, res: any) => {
    const {slug}: { slug: string } = req.params
    const LOG_COMPONENT = `fetch-hashtag-collection-for-slug-${slug}`
    if (!slug) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no hashtag collection slug in fetch hashtag collection by id req", slug)

        return res.send({status: "404", message: "no slug present in url for get hashtag collection request"})
    }

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const aHashtagCollection = await cmsClient.fetchHashtagCollection(slug);
            logClient.log(LOG_COMPONENT, "NOTICE",
                "GET hashtag collection by slug RESULT", aHashtagCollection);
            return res.send({hashtagCollection: aHashtagCollection});
        }
    }
}

const getChapterRoster = async (req: any, res: any) => {
    const LOG_COMPONENT = `fetch-chapter-roster`

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const chapterRoster = await cmsClient.fetchChapterRoster();
            logClient.log(LOG_COMPONENT, "NOTICE",
                "GET chapter rosteer RESULT", chapterRoster);
            return res.send({chapterRoster: chapterRoster});
        }
    }
}


const getMyProfile = async (req: any, res: any) => {
    const LOG_COMPONENT = 'get-my-profile'
    logClient.log(LOG_COMPONENT, "INFO",
        "GET My Profile");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const myProfile = await cmsClient.fetchUser(whoami.uid);
            logClient.log(LOG_COMPONENT + "-" + whoami, "INFO",
                "GET USER Profile", myProfile);
            return res.send({myAppProfile: myProfile});
        }
    }
}


const updateCreateExtendedProfile = async (req: any, res: any) => {
    const LOG_COMPONENT = "update-create-extended-profile"

    const headers = req.headers;

    const {
        shortBio,
        longBio,
        height,
        weight,
        age,
    } = req.body;

    logClient.log(LOG_COMPONENT, "NOTICE",
        "updating or creating extended profile for request", req.body);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);

        var profileData = {
            _id: "ext-profile-" + whoami.uid,
            userId: whoami.uid,
            userRef: cmsUtils.getSanityDocumentRef(whoami.uid),
        } as any

        if (shortBio) {
            profileData = {
                ...profileData,
                shortBio: shortBio ?? undefined,
            }
        }
        if (longBio) {
            profileData = {
                ...profileData,
                longBio: longBio,
            }
        }

        if (age && age !== 0) {
            profileData = {
                ...profileData,
                age: parseInt(age),
            }
        }
        if (weight && weight !== 0) {
            profileData = {
                ...profileData,
                weight: parseInt(weight),
            }
        }

        if (height) {
            const intermediateHeight: Height = JSON.parse(height);

            profileData = {
                ...profileData,
                height: intermediateHeight,
            }
        }

        const currentExtProfile = await cmsClient.fetchExtendedProfile(whoami.uid)

        const newExtProfile = await cmsClient.createReplaceExtendedProfile(whoami.uid, {...currentExtProfile[0], ...profileData})
        logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
            "created an Sanity Ext Profile", {newAppUser: newExtProfile});

        return res.status(200).json({newExtProfile: newExtProfile});
    }
}


const like = async (req: any, res: any) => {

    const headers = req.headers;

    const {likeeId, likeType} = req.body;
    const LOG_COMPONENT = `like-${likeType}-${likeeId}`

    logClient.log(LOG_COMPONENT, "NOTICE",
        `request to like ${likeType}`, likeeId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            `request to like ${likeType} by`, whoami);

        var processedLikeType;
        switch (likeType) {
            case 'profile-like':
                processedLikeType = LIKE_CATEGORY_ENUM.PROFILE_LIKE;
                break;
            case 'comment-like':
                processedLikeType = LIKE_CATEGORY_ENUM.COMMENT_LIKE;
                break;
            case 'post-like':
                processedLikeType = LIKE_CATEGORY_ENUM.POST_LIKE;
                break;
            default:
                processedLikeType = LIKE_CATEGORY_ENUM.PROFILE_LIKE;
                break;
        }

        const likeStatus = await cmsService.createLike(whoami.uid, likeeId, processedLikeType)
        if (likeStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Sanity Like", {likeStatus: "SUCCESS"});

            return res.status(200).json({likeStatus: "SUCCESS", body: likeStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating like", {likeStatus: "ERROR", message: likeStatus});

            return res.status(400).json({likeStatus: "ERROR", body: likeStatus});
        }
    }

    return res.status(401).json({likeStatus: "ERROR", body: "UNAUTHORIZED"});
}
const updatePosition = async (req: any, res: any) => {

    const headers = req.headers;

    const {
        longitude,
        latitude,
        timestamp,
        accuracy,
        altitude,
        heading,
        speed,
        speedAccuracy,
        floor,
    } = req.body;


    const LOG_COMPONENT = `update-position`

    logClient.log(LOG_COMPONENT, "NOTICE",
        `Updating user position`, {
            longitude,
            latitude,
            timestamp,
            accuracy,
            altitude,
            heading,
            speed,
            speedAccuracy,
            floor
        });

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            `request to update position by`, whoami);
        var position: SanityPosition = {
            longitude,
            latitude,
            timestamp,
            accuracy,
            altitude,
            heading,
            speed,
            speedAccuracy,
            floor,
        };

        const creationStatus = await cmsService.createPosition(whoami.uid, position)
        if (creationStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Sanity Position", {likeStatus: "SUCCESS"});

            return res.status(200).json({likeStatus: "SUCCESS", body: creationStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating position", {likeStatus: "ERROR", message: creationStatus});

            return res.status(400).json({likeStatus: "ERROR", body: creationStatus});
        }
    }

    return res.status(401).json({likeStatus: "ERROR", body: "UNAUTHORIZED"});
}

const blockProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {userId} = req.body;
    const LOG_COMPONENT = "block-profile-" + userId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to block profile", userId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to block profile by", whoami);

        const blockStatus = await cmsClient.createProfileBlock(whoami.uid, userId)
        if (blockStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Sanity Block", {blockStatus: "SUCCESS"});

            return res.status(200).json({blockStatus: "SUCCESS", body: blockStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating block", {blockStatus: "ERROR", message: blockStatus});

            return res.status(400).json({blockStatus: "ERROR", body: blockStatus});
        }
    }

    return res.status(401).json({blockStatus: "ERROR", body: "UNAUTHORIZED"});
}
const followProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {userId} = req.body;
    const LOG_COMPONENT = "follow-profile-" + userId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to follow profile", userId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to follow profile by", whoami);

        const followStatus = await cmsService.createProfileFollow(whoami.uid, userId)
        if (followStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Sanity Follow", {followStatus: "SUCCESS"});

            return res.status(200).json({followStatus: "SUCCESS", body: followStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating follow", {followStatus: "ERROR", message: followStatus});

            return res.status(400).json({followStatus: "ERROR", body: followStatus});
        }
    }

    return res.status(401).json({followStatus: "ERROR", body: "UNAUTHORIZED"});
}
const unlike = async (req: any, res: any) => {

    const headers = req.headers;

    const {likeId} = req.body;
    const LOG_COMPONENT = `unlike-likeid-${likeId}`

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to unlike profile ", likeId);


    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "DEBUG",
            `request to unlike by `, whoami);

        const likeStatus = await cmsService.removeLike(likeId);
        if (likeStatus.transactionId) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "deleted a Sanity Like", {unlikeStatus: "SUCCESS"});

            return res.status(200).json({unlikeStatus: "SUCCESS", body: likeStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error deleting like", {unlikeStatus: "ERROR", message: likeStatus});

            return res.status(400).json({unlikeStatus: "ERROR", body: likeStatus});
        }
    }

    return res.status(401).json({likeStatus: "ERROR", body: "UNAUTHORIZED"});
}
const unblockProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {blockId} = req.body;
    const LOG_COMPONENT = "unblock-profile-blockid-" + blockId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to unblock profile ", blockId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to unblock profile by ", whoami);

        const blockStatus = await cmsClient.removeBlock(blockId);
        if (blockStatus.transactionId) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "deleted a Sanity Block", {unblockStatus: "SUCCESS"});

            return res.status(200).json({unblockStatus: "SUCCESS", body: blockStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating block", {unblockStatus: "ERROR", message: blockStatus});

            return res.status(400).json({unblockStatus: "ERROR", body: blockStatus});
        }
    }

    return res.status(401).json({blockStatus: "ERROR", body: "UNAUTHORIZED"});
}

const unfollowProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {followId} = req.body;
    const LOG_COMPONENT = "unfollow-profile-followid-" + followId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to unfollow profile ", followId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to unfollow profile by ", whoami);

        const followStatus = await cmsService.removeFollow(followId);
        if (followStatus.transactionId) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "deleted a Sanity Follow", {unfollowStatus: "SUCCESS"});

            return res.status(200).json({unfollowStatus: "SUCCESS", body: followStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating follow", {unfollowStatus: "ERROR", message: followStatus});

            return res.status(400).json({unfollowStatus: "ERROR", body: followStatus});
        }
    }

    return res.status(401).json({followStatus: "ERROR", body: "UNAUTHORIZED"});
}


const getProfileLikes = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `get-profile-likes-${id}`
    logClient.log(LOG_COMPONENT, "ERROR",
        "Get  Profile Likes Request", id)
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in get profile like req", id)

        return res.send({status: "404", message: "no id present in url for get profile like request"})
    }

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profileLikes = await cmsClient.fetchProfileLikes(id);
            const amIInThisList = profileLikes?.find((like) => {
                if (like.liker._id === whoami.uid) {
                    return true;
                }
                return false
            })

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Profile Likes", {profileLikes, amIInThisList});

            res.status(200).send({profileLikes: profileLikes, amIInThisList});
        }
    }
}

const getVerifications = async (req: any, res: any) => {
    const LOG_COMPONENT = `get-all-verifications`
    logClient.log(LOG_COMPONENT, "ERROR",
        "Get  all member verifications")

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const memberVerifications = await cmsClient.fetchAllSpreadsheetRelations();

            const amIInThisList = memberVerifications?.find((verification) => {
                if (verification.userRef._id === whoami.uid) {
                    return true;
                }
                return false
            })

            logClient.log(LOG_COMPONENT, "NOTICE",
                "spreadsheet relations", {verifications: memberVerifications, amIInThisList});

            res.status(200).send({verifications: memberVerifications, amIInThisList});
        }
    }
}
const getTimelineEvents = async (req: any, res: any) => {
    const LOG_COMPONENT = `get-timeline-events`
    logClient.log(LOG_COMPONENT, "NOTICE",
        "Get  Profile TimelineEvents Request")

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profileTimelineEvents = await cmsService.fetchProfileTimelineEvents(whoami.uid);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "num Profile TimelineEvents", profileTimelineEvents.length);

            res.status(200).send({profileTimelineEvents: profileTimelineEvents});
        }
    }
}
// const getProfileBlocks = async (req: any, res: any) => {
//     const {id}: { id: string } = req.params
//     const LOG_COMPONENT = `get-profile-blocks-${id}`
//     logClient.log(LOG_COMPONENT, "ERROR",
//         "Get  Profile Blocks Request", id)
//     if (!id) {
//         logClient.log(LOG_COMPONENT, "ERROR",
//             "Error no user id in get profile block req", id)
//
//         return res.send({status: "404", message: "no id present in url for get profile block request"})
//     }
//
//     const headers = req.headers;
//     if (headers.authorization) {
//         const whoami = await authService.getUserFromAccessToken(headers.authorization);
//
//         if (!whoami.uid) {
//             res.status(400).json({error: "No valid user from this Access Token"})
//         } else {
//             const profileBlocks = await cmsClient.fetchProfileBlocks(id);
//
//             logClient.log(LOG_COMPONENT, "NOTICE",
//                 "Profile Blocks", profileBlocks);
//
//             res.status(200).send({profileBlocks});
//         }
//     }
// }
const getMyProfileBlocks = async (req: any, res: any) => {
    const LOG_COMPONENT = `get-my-profile-blocks`
    logClient.log(LOG_COMPONENT, "INFO",
        "Get my Profile Blocks Request")

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profileBlocks = await cmsClient.fetchMyProfileBlocks(whoami.uid);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "My Profile Blocks", profileBlocks);

            res.status(200).send({profileBlocks});
        }
    }
}
const getProfileFollows = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `get-profile-follows-${id}`
    logClient.log(LOG_COMPONENT, "ERROR",
        "Get  Profile Follows Request", id)
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in get profile like req", id)

        return res.send({status: "404", message: "no id present in url for get profile follows request"})
    }

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profileFollows = await cmsClient.fetchProfileFollows(id);
            const amIInThisList = profileFollows?.find((follow) => {
                if (follow.follower._id === whoami.uid) {
                    return true;
                }
                return false
            })

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Profile Follows", {profileFollows, amIInThisList});

            res.status(200).send({profileFollows: profileFollows, amIInThisList});
        }
    }
}
const getProfileComments = async (req: any, res: any) => {
    const {id, typeId}: { id: string, typeId: string } = req.params
    const LOG_COMPONENT = `get-comments-${typeId}s-${id}`
    logClient.log(LOG_COMPONENT, "ERROR",
        `Get Comments  ${typeId}s Request`, id)
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            `Error no user id in get ${typeId} comments req`, id)

        return res.send({status: "404", message: "no id present in url for get profile comments request"})
    }

    var processedCommentType;
    switch (typeId) {
        case 'profile-comment':
            processedCommentType = CommentCategoryEnum.PROFILE_COMMENT;
            break;
        case 'post-comment':
            processedCommentType = CommentCategoryEnum.POST_COMMENT;
            break;
        default:
            processedCommentType = CommentCategoryEnum.PROFILE_COMMENT;
            break;
    }

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profileComments = await cmsService.fetchProfileComments(processedCommentType, id, whoami.uid);

            logClient.log(LOG_COMPONENT, "NOTICE",
                `${typeId}s`, profileComments);

            res.status(200).send({profileComments: profileComments});
        }
    }
}
const getAllPosts = async (req: any, res: any) => {
    const LOG_COMPONENT = `get-all-posts`
    logClient.log(LOG_COMPONENT, "NOTICE",
        "Get  Profile Posts Request")

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profilePosts = await cmsService.fetchPosts(whoami.uid);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Posts", profilePosts?.length);

            return res.status(200).send({posts: profilePosts});
        }
    }
    return res.status(401).send({message: "NOt authorized", posts: []});
}
const getHashtaggedPostsPaginated = async (req: any, res: any) => {
    const {hashtagId, pageSize, lastId}: { hashtagId: string, pageSize: string, lastId: string } = req.params

    const LOG_COMPONENT = `get-hashtagged-posts-#${hashtagId}-${pageSize}-${lastId}`
    logClient.log(LOG_COMPONENT, "NOTICE",
        "Get  Hashtagged Posts Request")


    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const hashtaggedPosts = await cmsService.fetchHashtaggedPostsPaginated(whoami.uid, hashtagId, pageSize, lastId);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Posts", hashtaggedPosts?.length);

            return res.status(200).send({posts: hashtaggedPosts});
        }
    }
    return res.status(401).send({message: "NOt authorized", posts: []});
}

const commentDocument = async (req: any, res: any) => {

    const headers = req.headers;

    const {documentId, commentBody, commentType, hashtags} = req.body;
    const LOG_COMPONENT = `comment-${commentType}-` + documentId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to comment " + commentType, {documentId, commentBody, hashtags});

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            `request to comment ${commentType} by`, whoami);

        const commentStatus = await cmsService.createProfileComment(whoami.uid, documentId, commentType, commentBody);
        if (commentStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Sanity Comment", {commentStatus: "SUCCESS"});

            await cmsService.createOrNotHashtags(JSON.parse(hashtags), documentId);

            return res.status(200).json({commentStatus: "SUCCESS", body: commentStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating comment", {commentStatus: "ERROR", message: commentStatus});

            return res.status(400).json({commentStatus: "ERROR", body: commentStatus});
        }
    }

    return res.status(401).json({commentStatus: "ERROR", body: "UNAUTHORIZED"});
}
const createVerification = async (req: any, res: any) => {

    const headers = req.headers;
    const {rosterId} = req.body;

    const LOG_COMPONENT = `create-verification-${rosterId}`

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to claim ", rosterId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            `request to claim ${rosterId} by`, whoami);

        const verificationStatus = await cmsClient.createProfileRosterRelation(whoami.uid, rosterId);
        if (verificationStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Relationship from user to roster", {verificationStatus: "SUCCESS"});

            return res.status(200).json({verificationStatus: "SUCCESS", body: verificationStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating verification", {verificationStatus: "ERROR", message: verificationStatus});

            return res.status(400).json({verificationStatus: "ERROR", body: verificationStatus});
        }
    }

    return res.status(401).json({verificationStatus: "ERROR", body: "UNAUTHORIZED"});
}
const createPost = async (req: any, res: any) => {
    const LOG_COMPONENT = "create-post"
    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to create post")

    // use token to get firebaseUser and uid
    const user = await authService.getUserFromAccessToken(req.headers.authorization)
    if (!user.uid) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "No valid user from this Access Token")
        return res.status(400).json({error: "No valid user from this Access Token"})
    }

    // TODO: BLOG ABOUT WTF this SHAT is doing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const busboyC = require("busboy")
    const busboy = busboyC({headers: req.headers})

    let imageToBeUploaded = {}
    let imageFileName

    const otherFormData: any = {}

    busboy.on("file", (fieldname: any, file: any, info: any) => {
        const {filename, encoding, mimeType} = info

        logClient.log(LOG_COMPONENT, "INFO",
            "processing file from create post req:");

        logClient.log(LOG_COMPONENT, "INFO",
            "Data from post req image file", {fieldname, file, filename, encoding, mimeType});

        // if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
        //     return res.status(400).json({error: "Wrong file type submitted"})
        // }

        const imageExtension = filename.split(".")[filename.split(".").length - 1]

        imageFileName = `${Math.round(
            Math.random() * 1000000000000
        ).toString()}.${imageExtension}`
        const filepath = path.join(os.tmpdir(), imageFileName)
        imageToBeUploaded = {filepath, mimeType}

        const stream = fs.createWriteStream(filepath)

        file.pipe(stream)
    })

    busboy.on("finish", async () => {

        const {postBody, hashtags} = otherFormData

        logClient.log(LOG_COMPONENT, "INFO",
            "image complete uploaded...processing other data", {postBody, hashtags})

        let createPostResp
        // if (displayName) {
        //     displayResp = await authService.changeDisplayName(displayName, user.uid)
        //     appResp = await cmsClient.changeDisplayName(displayName, user.uid)
        // }

        // if (imageToBeUploaded && (imageToBeUploaded as any).filepath) {
        // upload to sanity
        createPostResp = await cmsService.createPost(imageToBeUploaded, user.uid, postBody)

        // }

        if(createPostResp != null) {
            await cmsService.createOrNotHashtags(JSON.parse(hashtags), createPostResp._id);
        }

        res.send({
            postCreated: createPostResp, status: 400
        })
        return;
    })

    busboy.on("field", (name: any, val: any, info: any) => {
        logClient.log("get-auth-user", "DEBUG",
            `Field [${name}]: value: %j`, val);
        otherFormData[name] = val
    })

    busboy.end(req.rawBody)
}
export default {
    getVerifications,
    getHashtaggedPostsPaginated,
    getMyProfile,
    getExtendedProfile,
    updateCreateExtendedProfile,
    getAllPostsPaginated,
    getAllProfiles,
    getProfileById,
    like,
    getPosition,
    blockProfile,
    getProfileLikes,
    unlike,
    createVerification,
    unblockProfile,
    commentDocument,
    createPost,
    getProfileComments,
    followProfile,
    unfollowProfile,
    getProfileFollows,
    getAllPosts,
    getCommentThreadPaginated,
    getPostById,
    getHashtagCollectionBySlug,
    getChapterRoster,
    updatePosition,
    getMyProfileBlocks,
    getTimelineEvents,
    getAllProfilesPaginated
}