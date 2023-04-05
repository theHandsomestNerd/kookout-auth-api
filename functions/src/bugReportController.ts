import * as logClient from "./logClient";
import authService from "./authService";
import * as path from "path";
import * as os from "os";
import * as fs from "fs";
import cmsClient from "./cmsClient";


const submitBugReport = async (req: any, functionRes: any) => {
    const LOG_COMPONENT = "submit-bug-report"
    logClient.log(LOG_COMPONENT, "NOTICE",
        "request to submit a bug", req.body)

    // use token to get firebaseUser and uid
    const user = await authService.getUserFromAccessToken(req.headers.authorization)
    if (!user.uid) {
        logClient.log(LOG_COMPONENT, "ERROR",
            "No valid user from this Access Token")
    }

    // TODO: BLOG ABOUT WTF this SHAT is doing
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const busboyC = require("busboy")
    const busboy = busboyC({headers: req.headers})

    let imageToBeUploaded:any = {}
    let imageFileName

    const otherFormData: any = {}

    busboy.on("file", (fieldname: any, file: any, info: any) => {
        const {filename, encoding, mimeType} = info

        logClient.log(LOG_COMPONENT, "INFO",
            "processing file from create bug report req:");

        logClient.log(LOG_COMPONENT, "INFO",
            "Data from bug report req image file", {fieldname, file, filename, encoding, mimeType});

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


        // request.fields['uiVersion'] = DefaultConfig.version;
        // request.fields['apiVersion'] = DefaultConfig.apiVersion;
        // request.fields['uiSanityDB'] = DefaultConfig.sanityDB;
        // request.fields['apiSanityDB'] = DefaultConfig.apiSanityDB;

        const {title,description, uiVersion, apiVersion, uiSanityDB, apiSanityDB} = otherFormData

        logClient.log(LOG_COMPONENT, "INFO",
            "image complete uploaded...processing other data", {title,description, uiVersion, apiVersion, uiSanityDB, apiSanityDB})

        let createBugReportResp

        // upload to sanity
        createBugReportResp = await cmsClient.uploadBugReport(imageToBeUploaded?.filepath, user.uid, title, description, uiVersion, apiVersion, uiSanityDB, apiSanityDB)

        functionRes.send({
            bugReportSubmitted: createBugReportResp
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


export default { submitBugReport}