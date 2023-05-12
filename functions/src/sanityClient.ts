// eslint-disable-next-line @typescript-eslint/no-var-requires
const client = require("@sanity/client")
const functions = require('firebase-functions')

console.log(functions.config());
const sanityClient = client({
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID ?? functions.config()?.sanity?.project_id ?? "xxxx",
    dataset: process.env.SANITY_STUDIO_API_APIDATASET ?? functions.config()?.sanity?.dataset,
    apiVersion: process.env.SANITY_STUDIO_API_VERSION ?? functions.config()?.sanity?.theversion ?? 1,
    token: process.env.SANITY_API_TOKEN ?? functions.config()?.sanity?.token,
    useCdn: false
})

export default sanityClient