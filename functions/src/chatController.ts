import * as logClient from "./logClient";
import cmsClient from "./cmsClient";
import authService from "./authService";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import {SanityExtendedUserProfile} from "../types";

const getExtendedProfile = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `fetch-ext-profile-for-user-${id}`
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in fetch ext profile req", id)

        res.send({status: "404", message: "no id present in url for ext profile request"})
        return
    }

    const headers = req.headers;

    logClient.log(LOG_COMPONENT, "NOTICE",
        "Authorization Headers", headers);

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        logClient.log(LOG_COMPONENT, "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const extProfile = await cmsClient.fetchExtendedProfile(id);
            logClient.log("server-side", "NOTICE",
                "GET USER RESULT", extProfile);
            res.status(200).send({extendedProfile: extProfile[0] ? extProfile[0] : null});
        }
    }


}

const updateCreateExtendedProfile = async (req: any, res: any) => {

    const LOG_COMPONENT = "update-create-extended-profile"
    logClient.log(LOG_COMPONENT, "NOTICE",
        "updating or creating extended profile for");

    const headers = req.headers;

    logClient.log(LOG_COMPONENT, "NOTICE",
        "Authorization Headers", headers);

    const {shortBio, longBio, weight, age} = req.body;



    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);

        logClient.log(LOG_COMPONENT, "NOTICE",
            "I am the user ", whoami);

        // const firebaseUser = await authService.getUser(whoami.uid);
        // if (!firebaseUser.uid) {
        //     logClient.log(LOG_COMPONENT, "NOTICE",
        //         "no valid user wit this token ", whoami);
        //     res.status(400).json({error: "No valid user from this Access Token"})
        // }

        var profileData: SanityExtendedUserProfile = {
            _id: "ext-profile-"+whoami.uid,
            shortBio: shortBio,
            userId: whoami.uid,
            longBio: longBio,
            age: weight?parseInt(age):0,
            weight: weight?parseInt(weight):0,
            height:{feet: 0,inches:0},
            gender:"",
        } as SanityExtendedUserProfile

        logClient.log(LOG_COMPONENT, "NOTICE",
            "profile from Body", profileData);
        // create datastore representation of extended Profile
        const newExtProfile = await cmsClient.createReplaceExtendedProfile(whoami.uid, profileData)
        logClient.log(LOG_COMPONENT, "NOTICE",
            "created an Sanity Ext Profile", {newAppUser: newExtProfile});

        res.status(200).json({newExtProfile: newExtProfile});
    }


}

const getAllProfiles = async (req: any, res: any) => {
    logClient.log("server-side", "NOTICE",
        "Getting All Profiles", req.params);

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        logClient.log("server-side", "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const allUsers = await cmsClient.fetchAllUsers();

            logClient.log("server-side", "NOTICE",
                "GET all profiles RESULTS", allUsers);

            res.send({profiles: [...allUsers]});
        }
    }


}


const getProfileById = async (req: any, res: any) => {
    const {id}: { id: string } = req.params
    const LOG_COMPONENT = `fetch-profile-for-user-${id}`
    if (!id) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "Error no user id in fetch profile req", id)

        res.send({status: "404", message: "no id present in url for profile request"})
        return
    }


    const headers = req.headers;

    logClient.log(LOG_COMPONENT, "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        logClient.log(LOG_COMPONENT, "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const aProfile = await cmsClient.fetchUser(id);
            logClient.log("server-side", "NOTICE",
                "GET USER by id RESULT", aProfile);
            res.send({appProfile: aProfile});
        }
    }


}


const getMyProfile = async (req: any, res: any) => {
    logClient.log("server-side", "NOTICE",
        "Getting my Profile", req.params);

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        logClient.log("server-side", "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            logClient.log("server-side", "NOTICE",
                "No valid whoami ", whoami);
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const myProfile = await cmsClient.fetchUser(whoami.uid);
            logClient.log("server-side", "NOTICE",
                "GET USER RESULT", myProfile);
            res.send({myAppProfile: myProfile});
        }
    }


}


export default {getMyProfile, getExtendedProfile, updateCreateExtendedProfile, getAllProfiles, getProfileById}