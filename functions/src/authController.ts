import * as logClient from "./logClient";
import authService from "./authService";
import cmsClient from "./cmsClient";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import PasswordAuthUtils from "./PasswordAuthUtils";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";


const registerAppUser = async (req: any, res: any) => {
    const LOG_COMPONENT = "register-app-user";
    logClient.log(LOG_COMPONENT, "NOTICE",
        "Registering a new user");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami: DecodedIdToken = await authService.getUserFromAccessToken(headers.authorization);
        if (!whoami.uid) {
            logClient.log(LOG_COMPONENT, "ERROR",
                "Registering a new user token bad!");
            // return res.status(400).json({error: "No valid user from this Access Token"})
        }

        const firebaseUser = await authService.getUser(whoami.uid);
        if (!firebaseUser.uid) {
            return res.status(400).json({error: "No valid user from this Access Token"})
        }

        // create datastore representation of user
        const provider = PasswordAuthUtils.findProvider(firebaseUser);
        const newAppUser = await cmsClient.createUser(whoami.email ?? "", whoami.uid, provider)
        logClient.log(LOG_COMPONENT, "NOTICE",
            "Created a SanityUser", {newAppUser});

        res.status(200).json({profile: newAppUser});
    }


}

const updateUserProfile = async (req: any, functionRes: any) => {
    const LOG_COMPONENT = "update-profile-info"
    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to edit profile info for a user")

    // use token to get firebaseUser and uid
    const user = await authService.getUserFromAccessToken(req.headers.authorization)
    if (!user.uid) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "No valid user from this Access Token")
        return functionRes.status(400).json({error: "No valid user from this Access Token"})
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
            "processing file from req:");

        logClient.log(LOG_COMPONENT, "INFO",
            "Data from image file", {fieldname, file, filename, encoding, mimeType});

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

        const {displayName, email} = otherFormData

        logClient.log(LOG_COMPONENT, "INFO",
            "image complete uploaded...processing other data",{displayName, email})

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
            imageResp = await authService.changeProfilePhotoURL(imageUrl, user.uid)
        }

        const allChanges = {
            email: emailResp?.email,
            displayName: displayResp?.displayName,
            photoURL: imageResp?.photoURL
        }

        logClient.log(LOG_COMPONENT, "DEBUG",
            "sanity update status ", {appResp})
        logClient.log(LOG_COMPONENT, "INFO",
            "all profile changes this session ", {allChanges})

        functionRes.send({
            allChanges
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

const getAuthUser = async (req: any, res: any) => {
    const LOG_COMPONENT = "get-auth-user";
    logClient.log(LOG_COMPONENT, "INFO",
        "Getting my auth user Profile");

    const headers = req.headers;

    if (headers.authorization) {
        const whoami = await authService.getUserFromAccessToken(headers.authorization);

        if (!whoami.uid) {
            logClient.log(LOG_COMPONENT, "ERROR",
                "No valid user from this Access Token");
            return res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            return res.send({myAuthProfile: whoami});
        }
    }
}

export default {registerAppUser, updateUserProfile, getAuthUser}