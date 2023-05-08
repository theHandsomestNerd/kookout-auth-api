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
        var isOnTheYard = false
        var onCampusPosition = ""

        if (sanityObj.name.includes("*")) {
            isOnTheYard = true;
            var namePositionTokenized = sanityObj.name?.split("*");
            onCampusPosition = namePositionTokenized[1] ? namePositionTokenized[1].trim() : "";
        }

        var theTokenizedName = sanityObj.name.replace("*", ",").replace(',', '').trim().split(' ');
        var firstName = "";
        var lastName = "";
        var middleName = "";
        var nickName = "";
        var otherChapterAffiliation = "Theta Chi(ΘX)";
        var nickNameIndex = -1;
        var title = "";
        var titleIndex = -1;

        // theTokenizedName = theTokenizedName.reduce((accumulated: string[], nameSegment) => {
        //     var accCopy = accumulated;
        //     if (nameSegment !== "") {
        //         accCopy.push(nameSegment)
        //     }
        //
        //     return accCopy;
        // }, [])

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

        var theTokenizedYear = sanityObj.year?.split(" ");

        var semester = theTokenizedYear[0];

        var year = theTokenizedYear[1]?.split("-");

            var theYear = year[0];
            var lineNumber = "";
        if(year.length == 2){
            theYear = year[0];
            if (theYear.length == 2) {
                theYear = "19" + theYear
            }

            lineNumber = "";
            if (year.length == 2) {
                lineNumber = year[1];
            }
        } else if(year.length == 1) {
            theYear = year[0];
            if (theYear.length == 2) {
                theYear = "19" + theYear
            }
        }

        var theSpouse = null;
        var theChildren: string[] | null = null;
            var theTokenizedSpouse = sanityObj.spouseChildren?.replace("\\", "/").split("/")

        if(sanityObj.spouseChildren && theTokenizedSpouse.length > 0) {

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


        var theTokenizedCityStateZip = null

        var theCity = null;
        var isLivesOnCampus = false

        var theTokenizedStateZip = [];

        var theState = ""
        var theZip = ""

        if (sanityObj.city && sanityObj.city !== "") {
            theTokenizedCityStateZip = sanityObj.city.split(',')

            if(theTokenizedCityStateZip.length ===2 ){
                theCity = theTokenizedCityStateZip[0];
                isLivesOnCampus = false
                if (theCity == "UMBC Campus") {
                    isLivesOnCampus = true
                    isOnTheYard = true
                }

                theTokenizedStateZip = theTokenizedCityStateZip[1].trim().split(" ");

                theState = theTokenizedStateZip[0].trim()
                theZip = theTokenizedStateZip[1].trim()
            } else if(theTokenizedCityStateZip.length ===1 ){
                theCity = theTokenizedCityStateZip[0];
            }
        }

        var theOccupation = sanityObj.occupation
        var isChapterInvisible = false;
        if (theOccupation.toLowerCase() === "chapter invisible") {
            theOccupation = ""
            isChapterInvisible = true;
        }

        var sanityFormattedObject: CSVThetaChiMemberType = {
            spreadsheetId: sanityObj.spreadsheetId,
            isChapterInvisible: isChapterInvisible,
            isOnTheYard: isOnTheYard,
            onCampusPosition: onCampusPosition?.trim(),
            isLivesOnCampus: isLivesOnCampus,
            firstName: firstName?.trim(),
            lastName: lastName?.trim(),
            middleName: middleName?.trim(),
            otherChapterAffiliation: otherChapterAffiliation,
            nickName: nickName?.trim(),
            title: title,
            year: theYear ?? "",
            semester: semester,
            lineNumber: lineNumber,
            crossingDate: new Date(sanityObj.crossingDate) ?? "",
            nameOfLine: sanityObj.nameOfLine,
            lineName: sanityObj.lineName,
            dopName: sanityObj.dopName,
            dob: new Date(sanityObj.dob) ?? "",
            // spouse: theSpouse,
            // children: theChildren,
            occupation: theOccupation,
            address: sanityObj.address,
            // city: theCity,
            // state: theState,
            // postalCode: theZip,
            homePhone: sanityObj.homePhone,
            workPhone: sanityObj.workPhone,
            cellPhone: sanityObj.cellPhone,
            email: sanityObj.email?.split(",").map(e => e.trim()) ?? []
        }

        if (theSpouse) {
            sanityFormattedObject = {...sanityFormattedObject, spouse: theSpouse}
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
        
        if (theChildren && theChildren.length > 0) {
            sanityFormattedObject = {...sanityFormattedObject, children: theChildren}
        }

        queue.enqueue(() => cmsClient.createSanityDocument(sanityFormattedObject, sanityObjectType));
    });

};

export default {processCsv}