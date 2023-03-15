import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as logClient from "./logClient";
import authClient from "./authClient";
import authService from "./authService";
import PasswordAuthUtils from "./PasswordAuthUtils";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import cmsClient from "./cmsClient";

// // Start writing functions
// // https://firebase.google.com/docs/functions/typescript
//
const app = express();
const corsOptionsDelegate = (req: any, callback: any) => {
    logClient.log("CORS", "NOTICE", "checking allowlist", {origin: req.header("Origin")});
    // let corsOptions;
    // if (allowlist.indexOf(req.header("Origin")) !== -1) {
    //   logClient.log("CORS", LogLevels.NOTICE, "origin in allowlist", {origin: req.header("Origin"), allowlist});
    //   corsOptions = {origin: allowlist}; // reflect (enable) the requested origin in the CORS response
    // } else {
    //   logClient.log("CORS", LogLevels.NOTICE, "origin NOT in allowlist", {origin: req.header("Origin"), allowlist});
    //   corsOptions = {origin: false}; // disable CORS for this request
    // }
    const corsOptions = {origin: true};

    callback(null, corsOptions); // callback expects two parameters: error and options
};

app.use(cors(corsOptionsDelegate));

const Logger = function (req: any, res: any, next: any) {
    logClient.createLogger(req, res, next);
    next();
};

app.use(Logger);

const getUserFromAccessToken = async (accessToken: string): Promise<DecodedIdToken> => {
    const LOG_COMPONENT = "get-user-id-from-access-token"

    const processedToken = accessToken.replace("Bearer ", "")
    const verifyTokenResponse: DecodedIdToken = await authClient.verifyToken(processedToken)

    logClient.log(LOG_COMPONENT, "NOTICE",
        "user verified? ", verifyTokenResponse)

    return verifyTokenResponse
}

app.get("/health-endpoint", (req, res, next) => {
    logClient.log("server-side", "NOTICE",
        "Hello from the Server Siiiiiide", req.params);

    res.send({status: "200"});

});

app.get("/get-all-profiles", async (req, res, next) => {
    logClient.log("server-side", "NOTICE",
        "Getting All Profiles", req.params);

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami = await getUserFromAccessToken(headers.authorization);

        logClient.log("server-side", "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const allUsers = await cmsClient.fetchAllUsers();

            logClient.log("server-side", "NOTICE",
                "GET USER RESULTS", allUsers);

            res.send({profiles: [...allUsers]});
        }
    }


});


app.post("/register-app-user", async (req, res, next) => {
    logClient.log("server-side", "NOTICE",
        "Registering a new user");

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami: DecodedIdToken = await getUserFromAccessToken(headers.authorization);

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


});

app.post("/update-user-profile", async (req: any, functionRes: any) => {
    const LOG_COMPONENT = "update-profile-info"
    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to edit profile info for a user ")
    console.log("authorization:", req.headers.authorization)

    // use token to get firebaseUser and uid
    const user = await getUserFromAccessToken(req.headers.authorization)
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
})

app.get("/get-my-profile", async (req, res, next) => {
    logClient.log("server-side", "NOTICE",
        "Getting my Profile", req.params);

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami = await getUserFromAccessToken(headers.authorization);

        logClient.log("server-side", "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const myProfile = await cmsClient.fetchUser(whoami.uid);
            logClient.log("server-side", "NOTICE",
                "GET USER RESULT", myProfile);
            res.send({myAppProfile: myProfile});
        }
    }


});
app.get("/get-auth-user", async (req, res, next) => {
    logClient.log("server-side", "NOTICE",
        "Getting my auth user Profile", req.params);

    const headers = req.headers;

    logClient.log("server-side", "NOTICE",
        "Authorization Headers", headers);


    if (headers.authorization) {
        const whoami = await getUserFromAccessToken(headers.authorization);

        logClient.log("server-side", "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {

            res.send({myAuthProfile: whoami});
        }
    }


});

app.get("/get-profile/:id", async (req, res, next) => {
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
        const whoami = await getUserFromAccessToken(headers.authorization);

        logClient.log(LOG_COMPONENT, "NOTICE",
            "I am the user ", whoami);

        if (!whoami.uid) {
            res.status(400).json({error: "No valid user from this Access Token"})
        } else {
            const aProfile = await cmsClient.fetchUser(id);
            logClient.log("server-side", "NOTICE",
                "GET USER RESULT", aProfile);
            res.send({appProfile: aProfile});
        }
    }


});
exports.app = functions.https.onRequest(app);
