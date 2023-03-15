import {log} from "./logClient";
import sanityClient from "./sanityClient";
import {v4 as uuidv4} from "uuid";
import {createReadStream} from "fs";
import {SanityImageAssetDocument} from "@sanity/client";

const createUser = async (email: string, userId: string, provider: any) => {
    const sanityType = "user"
    const newSanityDocument = {
        _id: userId,
        _type: sanityType,
        email: email,
        userId: userId,
        displayName: provider.displayName || email,
        loginProviders: [{...provider, _key: uuidv4()}]
    }

    log("createUser", "NOTICE", "Creating User", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        console.log("createUser", "ERROR", "could not create user", {email, userId, provider, e})
        return e
    })
}

const fetchUser = (userId: string):Promise<SanityUser|undefined> => {
    const LOG = "fetch-user"

    return sanityClient
        .fetch(
            `*[_type == "user" && userId == $userId]{
          _id,
          email,
          userId,
          displayName,
          profileImage,
          loginProviders[]{
            displayName,
            email,
            providerId,
            photoURL
          }
       }`,
            {userId}
        ).then((data: SanityUser[]) => {
            log(LOG, "NOTICE", "THe users raw", data)

            if (!data[0]) {
                console.log(Error(`Error retrieving user no user returned for ${userId}: `))
            }

            return data[0]
        }).catch((e: any) => {
            const error = "Error retrieving User"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving User Error: ${userId} - ` + e.toString()))
            return Promise.resolve(undefined);
        })
    return Promise.resolve(undefined);
}

const uploadUserProfileImage = async (filePath: any, userId: string): Promise<SanityImageAssetDocument> => {
    return sanityClient.assets.upload("image", createReadStream(filePath) as unknown as Blob,
            {filename: `${userId}-profile-photo`})
        .then(async (imageAsset: SanityImageAssetDocument) => {
            console.log("The Image Asset uploaded", imageAsset)
            const btUser = await fetchUser(userId)
            await sanityClient
                .patch(btUser?._id ?? "no-id")
                .set({
                    profileImage: {
                        _type: "image",
                        asset: {
                            _type: "reference",
                            _ref: imageAsset._id
                        }
                    }
                })
                .commit()

            return imageAsset
        })
        .catch((e: any) => {
            return Promise.reject(Error(`Error uploading user profile image asset to sanity for user ${userId} Error: ` + e.toString()))
        })
}

const changeDisplayName = (displayName: string, firebaseUid: string) => {
    const LOG = `change-displayname-${firebaseUid}`;

    if (!firebaseUid) {
        return Promise.reject("no sanity uuid to update displayname to "+displayName + firebaseUid)
    }

    return sanityClient
        .patch(firebaseUid)
        .set({displayName: displayName})
        .commit()
        .catch((e: any) => {
            console.log(LOG, "error: ", e)
            return Promise.reject(e)
        })

}


const fetchAllUsers = ():Promise<SanityUser[]> => {
    const LOG = "fetch-user"

    return sanityClient
        .fetch(
            `*[_type == "user"]{
          _id,
          email,
          userId,
          displayName,
          profileImage,
          loginProviders[]{
            displayName,
            email,
            providerId,
            photoURL
          }
       }`
        ).then((data: SanityUser[]) => {
            log(LOG, "NOTICE", "THe users raw", data)

            if (!data) {
                console.log(Error(`Error retrieving users: `))
            }

            return data
        }).catch((e: any) => {
            const error = "Error retrieving Users"
            log(LOG, "ERROR", error, {error: e})
            console.log(Error(`Error retrieving Users Error: - ` + e.toString()))
            return Promise.resolve([]);
        })
    return Promise.resolve([]);
}
export default {createUser, uploadUserProfileImage, changeDisplayName, fetchUser, fetchAllUsers};
