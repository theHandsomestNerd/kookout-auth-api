import * as logClient from "./logClient";
import * as functions from "firebase-functions";
import {SanityCsvToProcess} from "../types";
import csvClient, {CSVThetaChiMemberSpreadsheetType, CSVThetaChiMemberType} from "./csvClient";

import Queue from "queue-promise";
import cmsClient from "./cmsClient";

const queue = new Queue({
    concurrent: 1,
    interval: 1000 / 25,
});


const processCsv = async (req: any, functionRes: any) => {
    const csvReadReq: SanityCsvToProcess = req.body;
    const {dataset} = req.headers;

    logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
        "Request to process a csv", csvReadReq);

    // get type of object
    const sanityObjectType: string = csvReadReq.objectType ?? "";
    logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
        "Get requests for type ", sanityObjectType);

    // read csv into obj
    const csV = await csvClient.loadCSV(csvReadReq.csvFile?.asset?.url);

    logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
        "csv form file ", csV);
    let newObjects: CSVThetaChiMemberType[] = [];

    queue.on("resolve", (createdDocument: any) => {
        logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
            "Created a document ", createdDocument);
        // update request

        // update request with created ids
        logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
            `Created ${newObjects.length} new ${sanityObjectType}s`, newObjects);

        // once all resolved somehow
        if (queue.isEmpty) {
            logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
                "Finished processing CSV found", newObjects);

            functionRes.send({status: "200", newDocuments: newObjects});
        }
    });

    queue.on("reject", (error: any) => {
        logClient.log(`process-csv-into-sanity-documents-${dataset}`, "ERROR",
            "Could not create object", error);
        if (queue.isEmpty) {
            functionRes.send({status: "200", message: "Could not create obj"});
        }
    });

    newObjects = csV.map(async (sanityObj: CSVThetaChiMemberSpreadsheetType) => {
        functions.logger.log("new csv object", "INFO",
            "csv object", sanityObj)

        var theTokenizedName = sanityObj.name.split(' ');
        var firstName = "";
        var lastName = "";
        var middleName = "";
        var nickName = "";
        var otherChapterAffiliation = "";
        var nickNameIndex = -1;
        var title = "";
        var titleIndex = -1;

        if (theTokenizedName[theTokenizedName.length - 1].includes("(")) {
            otherChapterAffiliation = theTokenizedName[theTokenizedName.length - 1].replace("(", "").replace(")", "");

            switch (otherChapterAffiliation) {
                case "Towson":
                    otherChapterAffiliation = "Lambda Zeta(Towson)"
                    break;
                case "Frostburg":
                    otherChapterAffiliation = "Lambda Mu(Frostburg)"
                    break;
                case "ΘΘ":
                    otherChapterAffiliation = "Theta Theta(ΘΘ)"
                    break;
                case "AI":
                    otherChapterAffiliation = "Alpha Iota(Morgan State)"
                    break;
                case "ZG":
                    otherChapterAffiliation = "Zeta Gamma(Coppin)"
                    break;
                case "Xi":
                    otherChapterAffiliation = "Xi(Howard University)"
                    break;
                default:
                    otherChapterAffiliation = "Theta Chi(ΘX)"
            }


            theTokenizedName = theTokenizedName.slice(0, theTokenizedName.length - 1);
        }


        theTokenizedName.forEach((n, index) => {
            if (n.includes("\"")) {
                nickName = n;
                nickNameIndex = index;
            }

            if (n.includes("Jr")) {
                title = "Jr";
                titleIndex = index;
            }

            if (n.includes("Sr") || n.includes("Sr.")) {
                title = "Sr"
                titleIndex = index;
            }
        });

        // remove title
        if (titleIndex != -1) {
            theTokenizedName = theTokenizedName.slice(titleIndex, titleIndex + 1);
        }

        //remove nickname
        if (nickNameIndex != -1) {
            theTokenizedName = theTokenizedName.slice(nickNameIndex, nickNameIndex + 1);
        }


        var sizeOfNamesLeft = theTokenizedName.length;
        switch (sizeOfNamesLeft) {
            case 2:
                firstName = theTokenizedName[0];
                lastName = theTokenizedName[1];
                break;
            case 3:
                firstName = theTokenizedName[0];
                middleName = theTokenizedName[1];
                lastName = theTokenizedName[2];
                break;
            default:
                firstName = theTokenizedName[0];
        }


        functions.logger.log("firstname", "INFO",
            "parsing name", sanityObj.name);
        
        functions.logger.log("firstname", "INFO",
            "parsing name", firstName);
        functions.logger.log("middlename", "INFO",
            "parsing name", middleName);
        functions.logger.log("lastname", "INFO",
            "parsing name", lastName);
        functions.logger.log("title", "INFO",
            "parsing name", title);
        functions.logger.log("nickname", "INFO",
            "parsing name", nickName);
        functions.logger.log("other chapter", "INFO",
            "parsing name", otherChapterAffiliation);

        var theTokenizedYear = sanityObj.year.split(" ");

        var semester = theTokenizedYear[0];
        var year = theTokenizedYear[1].split("-");
        var theYear = null;
        var lineNumber = "";
        theYear = year[0];
        if (year.length == 2) {
            theYear = year[0];
            lineNumber = year[1];
        }

        var theTokenizedSpouse = sanityObj.spouseChildren.split("/")

        var theSpouse = theTokenizedSpouse[0];
        var theChildren: string[] = [];
        if (theTokenizedSpouse.length > 1) {
            if (theTokenizedSpouse[1].includes("&")) {

                theChildren = theTokenizedSpouse[1].split("&");
            }
            if (theTokenizedSpouse[1].includes(",")) {

                theChildren = theTokenizedSpouse[1].split(",");
            }
        }

        var theTokenizedCityStateZip = sanityObj.city.split(',')

        var theCity = theTokenizedCityStateZip[0];
        var theTokenizedStateZip = theTokenizedCityStateZip[1].split(" ");

        var theState = theTokenizedStateZip[0]
        var theZip = theTokenizedStateZip[1]


        const sanityFormattedObject: CSVThetaChiMemberType = {
            spreadsheetId: sanityObj.spreadsheetId,
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            otherChapterAffiliation: otherChapterAffiliation,
            nickName: nickName,
            title: title,
            year: theYear ?? "",
            semester: semester,
            lineNumber: lineNumber,
            crossingDate: new Date(sanityObj.crossingDate)??"",
            nameOfLine: sanityObj.nameOfLine,
            lineName: sanityObj.lineName,
            dopName: sanityObj.dopName,
            dob: new Date(sanityObj.dob)??"",
            spouse: theSpouse,
            children: theChildren,
            occupation: sanityObj.occupation,
            address: sanityObj.address,
            city: theCity,
            state: theState,
            postalCode: theZip,
            homePhone: sanityObj.homePhone,
            workPhone: sanityObj.workPhone,
            cellPhone: sanityObj.cellPhone,
            email: sanityObj.email,
        }

        queue.enqueue(() => cmsClient.createSanityDocument(sanityFormattedObject, sanityObjectType));
    });

};

export default {processCsv}