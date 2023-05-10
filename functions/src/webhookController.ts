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
        logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
            `Created ${newObjects.length} new ${sanityObjectType}s`);
        // update request with created ids

        // once all resolved somehow
        if (queue.isEmpty) {
        // logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
        //     `Created ${newObjects.length} new ${sanityObjectType}s`, newObjects);
            logClient.log(`process-csv-into-sanity-documents-${dataset}`, "NOTICE",
                `Finished processing CSV ${newObjects.length} total created`, newObjects);

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

    newObjects = csV.map((sanityObj: CSVThetaChiMemberSpreadsheetType) => {
        functions.logger.log("new csv object", "INFO",
            "csv object", sanityObj)
        let isOnTheYard = false
        let onCampusPosition = null

        if (sanityObj.name.includes("*")) {
            isOnTheYard = true;
            let namePositionTokenized = sanityObj.name?.split("*");
            if (namePositionTokenized.length === 2) {
                onCampusPosition = namePositionTokenized[1] ? namePositionTokenized[1].trim() : "";
            }

        }
        let theTokenizedName = sanityObj.name.replace("*", ",").replace(',', '').trim().split(' ');
        if (onCampusPosition) {
            theTokenizedName?.splice(theTokenizedName.length - 1, 1);
        }

        let firstName = "";
        let lastName = "";
        let middleName = "";
        let nickName = "";
        let otherChapterAffiliation = "Theta Chi(ΘX)";
        let nickNameIndex = -1;
        let title = "";
        let titleIndex = -1;

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


            theTokenizedName = theTokenizedName?.slice(0, theTokenizedName.length - 1);
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

            if (n === ("II")) {
                title = "II"
                titleIndex = index;
            }
            if (n === ("III")) {
                title = "III"
                titleIndex = index;
            }

        });

        console.log(theTokenizedName);
// remove title
        if (titleIndex !== -1) {
            theTokenizedName?.splice(titleIndex, 1);
        }
        console.log(theTokenizedName);

//remove nickname
        if (nickNameIndex !== -1) {
            theTokenizedName?.splice(nickNameIndex, 1);
        }


        let sizeOfNamesLeft = theTokenizedName.length;
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

        var theTokenizedYear = sanityObj.year.split(" ");

        var semester = null;
        var year = null;
        var theYear = null;
        var lineNumber = null;

        if (theTokenizedYear.length === 2) {
            theYear = null;
            lineNumber = "";
            semester = theTokenizedYear[0];
            year = theTokenizedYear[1].split("-");

            if (year.length === 2) {
                theYear = year[0];
                if (theYear.length == 2) {
                    theYear = "19" + theYear
                }
                lineNumber = year[1];
            } else if (year.length === 1) {
                theYear = year[0];
                if (year[0].length == 2) {
                    theYear = "19" + theYear
                }
            }
        }

        let theSpouse = null;
        let theChildren: string[] | null = null;
        let theTokenizedSpouse = sanityObj.spouseChildren?.replace("\\", "/").split("/")

        if (sanityObj.spouseChildren && theTokenizedSpouse.length > 0) {

            theSpouse = theTokenizedSpouse[0].toLowerCase() !== "single" ? theTokenizedSpouse[0] : "";
            theChildren = [];
            if (theTokenizedSpouse.length > 1) {
                if (theTokenizedSpouse[1].includes("&")) {
                    theChildren = theTokenizedSpouse[1]?.split("&");
                }

                if (theTokenizedSpouse[1].includes(",")) {
                    theChildren = theTokenizedSpouse[1]?.split(",");
                } else {
                    theChildren = [theTokenizedSpouse[1]];
                }
            }
        }


        let theTokenizedCityStateZip = null

        let theCity = null;
        let isLivesOnCampus = false

        let theTokenizedStateZip = [];

        let theState = ""
        let theZip = ""

        if (sanityObj.city && sanityObj.city !== "") {
            theTokenizedCityStateZip = sanityObj.city.split(',')

            if (theTokenizedCityStateZip.length === 2) {
                theCity = theTokenizedCityStateZip[0];
                isLivesOnCampus = false
                if (theCity == "UMBC Campus") {
                    isLivesOnCampus = true
                    isOnTheYard = true
                }

                theTokenizedStateZip = theTokenizedCityStateZip[1]?.trim()?.split(" ");

                if (theTokenizedStateZip.length == 2) {
                    theState = theTokenizedStateZip[0].trim()
                    theZip = theTokenizedStateZip[1].trim()
                }
            } else if (theTokenizedCityStateZip.length === 1) {
                theCity = sanityObj.city;
            }
        }

        let theOccupation = sanityObj.occupation
        let isChapterInvisible = false;
        if (theOccupation.toLowerCase().includes("chapter invisible")) {
            theOccupation = ""
            isChapterInvisible = true;
        }

        let sanityFormattedObject: CSVThetaChiMemberType = {
            spreadsheetId: sanityObj.spreadsheetId,
            isChapterInvisible: isChapterInvisible,
            isOnTheYard: isOnTheYard,
            isLivesOnCampus: isLivesOnCampus,
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
            middleName: middleName?.trim(),
            otherChapterAffiliation: otherChapterAffiliation,
            nickName: nickName?.trim(),
            title: title,
            year: theYear ?? "",
            crossingDate: new Date(sanityObj.crossingDate) ?? "",
            nameOfLine: sanityObj.nameOfLine,
            lineName: sanityObj.lineName,
            dopName: sanityObj.dopName,
            dob: new Date(sanityObj.dob) ?? "",
            occupation: theOccupation,
            address: sanityObj.address,
            homePhone: sanityObj.homePhone,
            workPhone: sanityObj.workPhone,
            cellPhone: sanityObj.cellPhone,
            email: sanityObj.email?.split(",").map(e => e?.trim()) ?? []
        }

        if (onCampusPosition) {
            sanityFormattedObject = {...sanityFormattedObject, onCampusPosition: onCampusPosition}
        }
        if (theCity) {
            sanityFormattedObject = {...sanityFormattedObject, city: theCity}
        }
        if (theState) {
            sanityFormattedObject = {...sanityFormattedObject, state: theState}
        }
        if (theZip) {
            sanityFormattedObject = {...sanityFormattedObject, postalCode: theZip}
        }
        if (semester) {
            sanityFormattedObject = {...sanityFormattedObject, semester: semester}
        }
        if (lineNumber) {
            sanityFormattedObject = {...sanityFormattedObject, lineNumber: lineNumber}
        }
        if (theSpouse) {
            sanityFormattedObject = {...sanityFormattedObject, spouse: theSpouse}
        }
        if (theChildren && theChildren.length > 0) {
            sanityFormattedObject = {...sanityFormattedObject, children: theChildren}
        }

        queue.enqueue(() => cmsClient.createSanityDocument(sanityFormattedObject, sanityObjectType));
    });

    functionRes.send({status: "200", message: `Submitted ${newObjects.length} requests`});
};

export default {processCsv}