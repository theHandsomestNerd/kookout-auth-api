import * as logClient from "./logClient";
import authService from "./authService";
import cmsClient from "./cmsClient";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import PasswordAuthUtils from "./PasswordAuthUtils";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";


const registerAppUser = async (req:any, res:any) => {
    logClient.log("server-side", "NOTICE",
        "Registering a new user");

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);

        logClient.log("server-side", "NOTICE",
            "I am the user ", whoami);


        // if (whoami) {
        //     const allUsers = await authService.queryAllUsers();
        logClient.log("server-side", "NOTICE",
            "Register user results", whoami);

        const firebaseUser = await authService.getUser(whoami.uid);
        if (!firebaseUser.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        }

        // create datastore representation of user
        const provider = PasswordAuthUtils.findProvider(firebaseUser);
        logClient.log("server-side", "NOTICE",
            "provider", {provider, firebaseUser});
        const newAppUser = await cmsClient.createUser(whoami.email ?? "", whoami.uid, provider)
        logClient.log("server-side", "NOTICE",
            "created a Sanity User", {newAppUser});

        res.status(200).json({profile: newAppUser});
    }


}

const updateUserProfile = async (req: any, functionRes: any) => {
    const LOG_COMPONENT = "update-profile-info"
    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to edit profile info for a user ")
    console.log("authorization:", req.headers.authorization)

    // use token to get firebaseUser and uid
    const user = await authService.getUserFromAccessToken(req.headers.authorization)
    if (!user.uid) {
        functionRes.status(400).json({error: "No valid user from this Access Token"})
    }
    console.log("user found", user, user.uid);

    // TODO: BLOG ABOUT WTF this SHAT is doing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const busboyC = require("busboy")
    const busboy = busboyC({headers: req.headers})

    let imageToBeUploaded = {}
    let imageFileName

    const otherFormData: any = {}

    busboy.on("file", (fieldname: any, file: any, info: any) => {
        const {filename, encoding, mimeType} = info
        console.log("processing file from req:", info)
        console.log(fieldname, file, filename, encoding, mimeType)

        // if (mimeType !== "image/jpeg" && mimeType !== "image/png") {
        //     return functionRes.status(400).json({error: "Wrong file type submitted"})
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
        console.log("image complete uploaded")
        const {displayName, email} = otherFormData


        let displayResp, emailResp, imageResp, appResp
        if (displayName) {
            displayResp = await authService.changeDisplayName(displayName, user.uid)
            appResp = await cmsClient.changeDisplayName(displayName, user.uid)
        }
        if (email) {
            emailResp = await authService.changeEmail(email, user.uid)
        }
        if (imageToBeUploaded && (imageToBeUploaded as any).filepath) {
            // upload to sanity
            const imageAsset = await authService.saveUserProfileImage(imageToBeUploaded, user.uid)

            const imageUrl = imageAsset.url
            console.log("sanity image url ", imageUrl)
            imageResp = await authService.changeProfilePhotoURL(imageUrl, user.uid)
            console.log("firebase image url ", imageResp.photoUrl)
        }

        const allChanges = {
            email: emailResp?.email,
            displayName: displayResp?.displayName,
            photoURL: imageResp?.photoURL
        }

        logClient.log(LOG_COMPONENT, "NOTICE",
            "sanity update status", {appResp})
        logClient.log(LOG_COMPONENT, "NOTICE",
            "all profile changes this session", {allChanges})

        functionRes.send({
            allChanges
        })
        return;
    })

    busboy.on("field", (name: any, val: any, info: any) => {
        console.log(`Field [${name}]: value: %j`, val)
        otherFormData[name] = val
    })

    busboy.end(req.rawBody)
}

const getAuthUser = async (req:any, res:any) => {
    logClient.log("server-side", "NOTICE",
        "Getting my auth user Profile", req.params);

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

            res.send({myAuthProfile: whoami});
        }
    }


}

export default {registerAppUser, updateUserProfile, getAuthUser}