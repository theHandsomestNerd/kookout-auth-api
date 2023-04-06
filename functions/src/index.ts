import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as logClient from "./logClient";
import chatController from "./chatController";
import authController from "./authController";
import bugReportController from "./bugReportController";
const version = require('./version.js');

const app = express();
const corsOptionsDelegate = (req: any, callback: any) => {
    // logClient.log("CORS", "NOTICE", "checking allowlist", {origin: req.header("Origin")});
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
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '100mb', parameterLimit: 100000, extended: false},));

const Logger = function (req: any, res: any, next: any) {
    logClient.createLogger(req, res, next);
    next();
};

app.use(Logger);

logClient.log("cookout-api", "NOTICE",
    `The server can be reached: Running version - `, version);

app.get("/health-endpoint", (req, res, next) => {
    logClient.log("server-side-health-endpoint", "NOTICE",
        `The server can be reached: Running version ${version} sanityDB ${process.env.SANITY_STUDIO_API_APIDATASET}`, req.params);

    res.send({status: "200", apiVersion: version, sanityDB: process.env.SANITY_STUDIO_API_APIDATASET});
});

app.post("/register-app-user", authController.registerAppUser);
app.post("/update-user-profile", authController.updateUserProfile);
app.get("/get-auth-user", authController.getAuthUser);

app.get("/get-profile/:id", chatController.getProfileById);
app.get("/get-my-profile", chatController.getMyProfile);
app.get("/get-ext-profile/:id", chatController.getExtendedProfile);
app.post("/update-create-ext-profile", chatController.updateCreateExtendedProfile);
app.get("/get-all-profiles", chatController.getAllProfiles);
app.get("/get-all-profiles-paginated", chatController.getAllProfilesPaginated);

app.post("/like-profile", chatController.likeProfile);
app.post("/unlike-profile", chatController.unlikeProfile);
app.get("/get-profile-likes/:id", chatController.getProfileLikes);

app.post("/comment-profile", chatController.commentProfile);
// app.post("/uncomment-profile", chatController.commentProfile);
app.get("/get-profile-comments/:id", chatController.getProfileComments);

app.post("/follow-profile", chatController.followProfile);
app.post("/unfollow-profile", chatController.unfollowProfile);
app.get("/get-profile-follows/:id", chatController.getProfileFollows);

app.post("/block-profile", chatController.blockProfile);
app.post("/unblock-profile", chatController.unblockProfile);
// app.get("/get-profile-blocks/:id", chatController.getProfileBlocks);
app.get("/get-my-profile-blocks", chatController.getMyProfileBlocks);

app.get("/get-timeline-events", chatController.getTimelineEvents);

// app.post("/create-my-user-profile-photos-album", chatController.updateCreateExtendedProfile);
// app.post("/create-my-user-photo", chatController.updateCreateExtendedProfile);
// app.post("/create-my-user-profile-photo", chatController.updateCreateExtendedProfile);
// app.post("/delete-my-album", chatController.updateCreateExtendedProfile);
// app.post("/get-album/:id", chatController.updateCreateExtendedProfile);
// app.post("/get-albums/:userId", chatController.updateCreateExtendedProfile);
app.post("/submit-bug-report", bugReportController.submitBugReport);

app.post("/create-post", chatController.createPost);
// app.post("/delete-post", chatController.updateCreateExtendedProfile);
// app.post("/get-post/:id", chatController.updateCreateExtendedProfile);
app.get("/get-all-posts", chatController.getAllPosts);

exports.app = functions.https.onRequest(app);
