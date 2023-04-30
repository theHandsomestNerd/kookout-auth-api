# kookout-auth-api

[![Deploy to Firebase Hosting on merge](https://github.com/theHandsomestNerd/kookout-auth-api/actions/workflows/firebase-hosting-merge.yml/badge.svg?branch=main)](https://github.com/theHandsomestNerd/kookout-auth-api/actions/workflows/firebase-hosting-merge.yml)
[![Backup Sanity db](https://github.com/theHandsomestNerd/kookout-auth-api/actions/workflows/main.yml/badge.svg?branch=main)](https://github.com/theHandsomestNerd/kookout-auth-api/actions/workflows/main.yml)

Authentication API for firebase auth. This project includes the 
sanity project and the firebase(gcp) functions project

# Kookout Architecture Diagram
![architecture-diagram.png](.readme%2Farchitecture-diagram.png)

## Firebase:

So this is a firebase project which means that functions can be deployed to fb project using those allocated assets.
You can view details about each asset in the [Firebase Console for kookout-for-nupes](https://console.firebase.google.com/u/0/project/kookout-for-nupes/).

### FirebaseFunctions - express server with endpoints that run auth somethings

1. add env file at root with:
   * SANITY_STUDIO_API_PROJECT_ID
   * SANITY_STUDIO_API_APIDATASET
   * SANITY_API_TOKEN - create a new one
     in [sanity MANAGEMENT dashboard](https://www.sanity.io/organizations/ouPWjZwq7/project/abtncxbi/members/invitations)
     if you don't have one and label with your name

* this env file is deployed with the function to the cloud server
   * format
       ```
           SANITY_STUDIO_API_PROJECT_ID=project-id-here
           SANITY_STUDIO_API_APIDATASET=xxxxxxxx
           SANITY_API_TOKEN=ajsfkhf-example.api.token-afihfn9
       ```

2. Install dependencies
    ```
    npm install
    ```

3. Run functions locally
    ```
    npm run serve
    ```
   * Function running at http://127.0.0.1:5001/kookout-for-nupes/us-central1/app

### Firebase Hosting
This will be covered in the [kookout Flutter repo](https://github.com/theHandsomestNerd/kookout#readme).

### Firebase Remote Config
Add JSON parameters for deployment, development, and production modeling below
   ```json
     {
        "sanityProjectId":"xxxxxx",
        "sanityDB":"development",
        "blankUrl":"",
        "authBaseUrl":"https://us-central1-kookout-for-nupes.cloudfunctions.net/app","homepageProfileDurationSecs":"7","homepagePostDurationSecs":"8"
      }
   ```

## Sanity

### Run dashboard locally

1. Build and start the Sanity Server
    ```agsl
        > cd the-handsomest-nerd-auth
        > sanity start
    ```
2. Browse to https://localhost:3333
3. Login with Google

### Deploy Sanity

    sanity deploy
* sanity Studio is deployed to https://kookout.sanity.studio/
* Login with Google Creds

## GitHub Actions
CI/CD process that deploys repo to firebase.
    1. the .env file is deployed with 
the .github folder has the "Actions"
1. merge - whenever code is merged to master this script runs.
   1. Checks out repo
   1. builds repo
   1. deploys repo to firebase project
2. main - backup sanity db
   * currently scheduled to run at 04:00 UTC on the 1st and 17th of every month
   1. downloads a copy of all sanity db and assets
   1. creates a tarball
   1. stores in github for download

