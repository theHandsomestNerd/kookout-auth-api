import * as logClient from "./logClient";
import cmsClient from "./cmsClient";
import authService from "./authService";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import {Height} from "../types";

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

            const response = extProfile[0] ? extProfile[0] : null
            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "Ext Profile Resp:", response);

            return res.status(200).send({extendedProfile: response});
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
            const allUsers = await cmsClient.fetchAllUsers();

            logClient.log(LOG_COMPONENT + "-" + whoami.uid, "DEBUG",
                "GET all profiles RESULTS", allUsers);

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

        const likeStatus = await cmsClient.createProfileLike(whoami.uid, userId)
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

        const followStatus = await cmsClient.createProfileFollow(whoami.uid, userId)
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

        const likeStatus = await cmsClient.removeLike(likeId);
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

        const followStatus = await cmsClient.removeFollow(followId);
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

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Profile Likes", profileLikes);

            res.status(200).send({profileLikes: profileLikes});
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

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Profile Follows", profileFollows);

            res.status(200).send({profileFollows: profileFollows});
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
            const profileComments = await cmsClient.fetchProfileComments(id);

            logClient.log(LOG_COMPONENT, "NOTICE",
                "Profile Comments", profileComments);

            res.status(200).send({profileComments: profileComments});
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

        const commentStatus = await cmsClient.createProfileComment(whoami.uid, userId, commentBody);
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
export default {
    getMyProfile,
    getExtendedProfile,
    updateCreateExtendedProfile,
    getAllProfiles,
    getProfileById,
    likeProfile,
    getProfileLikes,
    unlikeProfile,
    commentProfile,
    getProfileComments,
    followProfile,
    unfollowProfile,
    getProfileFollows
}