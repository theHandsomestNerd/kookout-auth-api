import {ListUsersResult, UserInfo, UserRecord} from "firebase-admin/auth"
import authClient from "./authClient";
import cmsClient from "./cmsClient";
import {DecodedIdToken} from "firebase-admin/lib/auth";
import * as logClient from "./logClient";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const admin = require("firebase-admin")
// eslint-disable-next-line @typescript-eslint/no-var-requires
// const serviceAccount = require("./the-black-domain-firebase-adminsdk-h1hfd-f2d03fe336-service-account-2.json")



const createUser = (email: string, password: string) => {
  return admin.auth().createUser({
    email,
    emailVerified: false,
    password: password,
    displayName: email.split("@")[0],
    // photoURL: "http://www.example.com/12345678/photo.png",
    disabled: false
  })
    .then((userRecord: UserRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      // console.log("Successfully created new user:", userRecord, password);
      //create Sanity User
      return userRecord
    })
    .catch((error: any) => {
      const errorCode = error.code
      const errorMessage = error.message
      console.log("ERROR creating new user:", email, password)
      console.log(errorMessage, errorCode)
      return Promise.reject(Error(errorMessage))
      // ..
    })

}

const queryAllUsers = () => {
  const listAllUsers = async (nextPageToken:string | undefined) =>  {
    // List batch of users, 1000 at a time.
    var allUsers:any[] = [];
    await admin.auth()
        .listUsers(1000, nextPageToken)
        .then((listUsersResult:ListUsersResult) => {
          listUsersResult.users.forEach((userRecord:UserRecord) => {
            console.log('user', userRecord.toJSON());
            allUsers.push(userRecord.toJSON())
          });
          if (listUsersResult.pageToken) {
            // List next batch of users.
            listAllUsers(listUsersResult.pageToken);
          }
        })
        .catch((error:any) => {
          console.log('Error listing users:', error);
        });
    return allUsers;
  };
// Start listing users from the beginning, 1000 at a time.
  return listAllUsers(undefined);


  // return admin.auth().getUsers([])
  //     .then((userResult: GetUsersResult) => {
  //
  //       return userResult
  //     })
  //     .catch((error: any) => {
  //       const errorCode = error.code
  //       const errorMessage = error.message
  //       console.log("ERROR getting users:",error)
  //       console.log(errorMessage, errorCode)
  //       return Promise.reject(Error(errorMessage))
  //       // ..
  //     })

}

const getUser = (firebaseUserId: string): Promise<UserRecord> => {
  return admin.auth().getUser(firebaseUserId)
    .then((userRecord: UserRecord) => {
      // See the UserRecord reference doc for the contents of userRecord.
      // console.log(`Successfully fetched user data: ${userRecord.toJSON()}`);
      return userRecord
    })
    .catch((error: any) => {
      console.log("Error fetching user data:", error)
      return {} as UserRecord
    })
}

const changeDisplayName = (displayName: string, firebaseUid: string) => {
  return admin.auth().updateUser(firebaseUid, {
    displayName: displayName
  }).then((userRecord: UserRecord) => {
    console.log("User Profile displayname updated correctly", userRecord)
    return userRecord
  }).catch((error: any) => {
    console.log("Error updating user displayname:", error)
    return {} as UserRecord
  })
}

const changeEmail = (email: string, firebaseUid: string) => {
  return admin.auth().updateUser(firebaseUid, {
    email: email
  }).then((userRecord: UserRecord) => {
    console.log("User Profile email updated correctly", userRecord)
    return userRecord
  }).catch((error: any) => {
    console.log("Error updating user email:", error)
    return {} as UserRecord
  })
}

const changeProfilePhotoURL = (photoURL: string, firebaseUid: string) => {
  return admin.auth().updateUser(firebaseUid, {
    photoURL: photoURL
  }).then((userRecord: UserRecord) => {
    console.log("User Profile photoURL updated correctly", userRecord)
    return userRecord
  }).catch((error: any) => {
    console.log("Error updating user photoURL:", error)
    return {} as UserRecord
  })
}


const saveUserProfileImage = async (imageFile?: any, userId?: string) => {
  if (userId) {
    if (imageFile.filepath) {
      return cmsClient.uploadUserProfileImage(imageFile.filepath, userId)
    }

    return Promise.reject(Error("no user profile image"))
  }
  return Promise.reject(Error("no userId"))
}

const findProvider = (firebaseUser: any, providerName: string) => {
  return firebaseUser?.providerData?.find((provider: UserInfo) => {
    if (provider.providerId === providerName) {
      return provider;
    }
    return undefined;
  });
};

const getUserFromAccessToken = async (accessToken: string): Promise<DecodedIdToken> => {
  const LOG_COMPONENT = "get-user-id-from-access-token"

  const processedToken = accessToken.replace("Bearer ", "")
  const verifyTokenResponse: DecodedIdToken = await authClient.verifyToken(processedToken)

  logClient.log(LOG_COMPONENT, "INFO",
      "user verified? ", verifyTokenResponse !== undefined)

  return verifyTokenResponse
}

export default { saveUserProfileImage, createUser, getUser, getUserFromAccessToken, changeDisplayName, changeEmail, changeProfilePhotoURL, queryAllUsers, findProvider}