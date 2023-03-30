import * as logClient from "./logClient";
import cmsClient from "./cmsClient";
import authService from "./authService";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import {Height} from "../types";
import cmsService from "./cmsService";
import cmsUtils from "./cmsUtils";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";

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

            if(extProfile.length == 0 ){
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "Delivering 400:", response);
                return res.status(200).send({noExtendedProfile: "No Ext profile", userId: whoami.uid});
            }

            return res.status(200).send({extendedProfile: response ?? "No Extended Profile"});
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
        iAm,
        imInto,
        imOpenTo,
        whatIDo,
        whatImLookingFor,
        whatInterestsMe,
        whereILive,
        gender,
        sexPreferences
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
        if (iAm) {
            profileData = {
                ...profileData,
                iAm: iAm,
            }
        }
        if (imInto) {
            profileData = {
                ...profileData,
                imInto: imInto,
            }
        }
        if (imOpenTo) {
            profileData = {
                ...profileData,
                imOpenTo: imOpenTo,
            }
        }
        if (whatIDo) {
            profileData = {
                ...profileData,
                whatIDo: whatIDo,
            }
        }
        if (whatImLookingFor) {
            profileData = {
                ...profileData,
                whatImLookingFor: whatImLookingFor,
            }
        }
        if (whatInterestsMe) {
            profileData = {
                ...profileData,
                whatInterestsMe: whatInterestsMe,
            }
        }
        if (whatImLookingFor) {
            profileData = {
                ...profileData,
                whatImLookingFor: whatImLookingFor,
            }
        }
        if (whereILive) {
            profileData = {
                ...profileData,
                whereILive: whereILive,
            }
        }
        if (sexPreferences) {
            profileData = {
                ...profileData,
                sexPreferences: sexPreferences,
            }
        }

        if (gender) {
            profileData = {
                ...profileData,
                gender: gender,
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


const likeProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {userId} = req.body;
    const LOG_COMPONENT = "like-profile-" + userId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to like profile", userId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to like profile by", whoami);

        const likeStatus = await cmsService.createProfileLike(whoami.uid, userId)
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
const unlikeProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {likeId} = req.body;
    const LOG_COMPONENT = "unlike-profile-likeid-" + likeId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to unlike profile ", likeId);

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to unlike profile by ", whoami);

        const likeStatus = await cmsService.removeLike(likeId);
        if (likeStatus.transactionId) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "deleted a Sanity Like", {unlikeStatus: "SUCCESS"});

            return res.status(200).json({unlikeStatus: "SUCCESS", body: likeStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating like", {unlikeStatus: "ERROR", message: likeStatus});

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
const getTimelineEvents = async (req: any, res: any) => {
    const LOG_COMPONENT = `get-timeline-events`
    logClient.log(LOG_COMPONENT, "ERROR",
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
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `get-profile-comments-${id}`
    logClient.log(LOG_COMPONENT, "ERROR",
        "Get  Profile Comments Request", id)
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in get profile comments req", id)

        return res.send({status: "404", message: "no id present in url for get profile comments request"})
    }

    const headers = req.headers;
    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profileComments = await cmsService.fetchProfileComments(id, whoami.uid);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Profile Comments", profileComments);

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
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const profilePosts = await cmsService.fetchPosts(whoami.uid);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Posts", profilePosts);

            res.status(200).send({posts: profilePosts});
        }
    }
}

const commentProfile = async (req: any, res: any) => {

    const headers = req.headers;

    const {userId, commentBody} = req.body;
    const LOG_COMPONENT = "comment-profile-" + userId

    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to comment profile", {userId, commentBody});

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        logClient.log(LOG_COMPONENT, "NOTICE",
            "request to comment profile by", whoami);

        const commentStatus = await cmsService.createProfileComment(whoami.uid, userId, commentBody);
        if (commentStatus._id) {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "NOTICE",
                "created a Sanity Comment", {commentStatus: "SUCCESS"});

            return res.status(200).json({commentStatus: "SUCCESS", body: commentStatus});
        } else {
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "ERROR",
                "error creating comment", {commentStatus: "ERROR", message: commentStatus});

            return res.status(400).json({commentStatus: "ERROR", body: commentStatus});
        }
    }

    return res.status(401).json({commentStatus: "ERROR", body: "UNAUTHORIZED"});
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

        const {postBody} = otherFormData

        logClient.log(LOG_COMPONENT, "INFO",
            "image complete uploaded...processing other data", {postBody})

        let createPostResp
        // if (displayName) {
        //     displayResp = await authService.changeDisplayName(displayName, user.uid)
        //     appResp = await cmsClient.changeDisplayName(displayName, user.uid)
        // }

        // if (imageToBeUploaded && (imageToBeUploaded as any).filepath) {
            // upload to sanity
            createPostResp = await cmsService.createPost(imageToBeUploaded, user.uid, postBody)

        // }


        res.send({
            postCreated: createPostResp
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
    getMyProfile,
    getExtendedProfile,
    updateCreateExtendedProfile,
    getAllProfiles,
    getProfileById,
    likeProfile,
    blockProfile,
    getProfileLikes,
    unlikeProfile,
    unblockProfile,
    commentProfile,
    createPost,
    getProfileComments,
    followProfile,
    unfollowProfile,
    getProfileFollows,
    getAllPosts,
    // getProfileBlocks,
    getMyProfileBlocks,
    getTimelineEvents
}