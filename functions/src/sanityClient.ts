// eslint-disable-next-line @typescript-eslint/no-var-requires
const client = require("@sanity/client")
const functions = require('firebase-functions')

const sanityClient = client({
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID ?? functions.config().SANITY_STUDIO_API_PROJECT_ID,
    dataset: process.env.SANITY_STUDIO_API_APIDATASET ?? functions.config().SANITY_STUDIO_API_APIDATASET,
    apiVersion: process.env.SANITY_STUDIO_API_VERSION ?? functions.config().SANITY_STUDIO_API_VERSION,
    token: process.env.SANITY_API_TOKEN ?? functions.config().SANITY_API_TOKEN,
    useCdn: false
})

export default sanityClient
