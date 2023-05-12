import * as functions from "firebase-functions";
import express from "express";
import cors from "cors";
import * as logClient from "./logClient";
import chatController from "./chatController";
import authController from "./authController";
import bugReportController from "./bugReportController";
import webhookController from "./webhookController";

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
app.get("/get-all-profiles-paginated/:pageSize/:lastId", chatController.getAllProfilesPaginated);
app.get("/get-all-profiles-paginated/:pageSize", chatController.getAllProfilesPaginated);

app.post("/like", chatController.like);
app.post("/unlike", chatController.unlike);
app.get("/get-profile-likes/:id", chatController.getProfileLikes);

// app.post("/uncomment-profile", chatController.commentProfile);
app.get("/get-comments/:typeId/:id", chatController.getProfileComments);

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
app.post("/create-verification", chatController.createVerification);
app.get("/get-verifications", chatController.getVerifications);
// app.post("/delete-post", chatController.updateCreateExtendedProfile);
app.get("/get-post/:id", chatController.getPostById);
app.get("/get-all-posts", chatController.getAllPosts);
app.get("/get-all-posts-paginated/:pageSize/:lastId", chatController.getAllPostsPaginated);
app.get("/get-all-posts-paginated/:pageSize", chatController.getAllPostsPaginated);
app.get("/get-hashtagged-posts-paginated/:hashtagId/:pageSize/:lastId", chatController.getHashtaggedPostsPaginated);
app.get("/get-hashtagged-posts-paginated/:hashtagId/:pageSize", chatController.getHashtaggedPostsPaginated);

app.post("/comment-document", chatController.commentDocument);
app.get("/get-comment-thread-paginated/:documentId/:pageSize/:lastId", chatController.getCommentThreadPaginated);
app.get("/get-comment-thread-paginated/:documentId/:pageSize", chatController.getCommentThreadPaginated);
app.post("/update-position", chatController.updatePosition);
app.get("/get-position/:id", chatController.getPosition);

app.get("/get-chapter-roster", chatController.getChapterRoster);
app.get("/get-hashtag-collection-by-slug/:slug", chatController.getHashtagCollectionBySlug);
app.post("/process-csv-into-sanity-documents",webhookController.processCsv)

exports.app = functions.https.onRequest(app);
