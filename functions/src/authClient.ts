import {auth} from "firebase-admin";
import DecodedIdToken = auth.DecodedIdToken;

const admin = require("firebase-admin")
admin.initializeApp()

const verifyToken = (token: string): Promise<DecodedIdToken> => {
    return admin.auth().verifyIdToken(token)
        .then((decodedIdToken: DecodedIdToken) => {
            // See the UserRecord reference doc for the contents of userRecord.
            // console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
            return decodedIdToken
        })
        .catch((error: any) => {
            console.log("Error fetching user data from token:", error)
            return {} as DecodedIdToken
        })
}

export default {
    verifyToken
}