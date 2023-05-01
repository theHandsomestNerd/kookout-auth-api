// eslint-disable-next-line @typescript-eslint/no-var-requires
const client = require("@sanity/client")
const functions = require('firebase-functions')

const sanityClient = client({
    projectId: functions.config()?.sanity?.project_id ?? process.env.SANITY_STUDIO_API_PROJECT_ID,
    dataset: functions.config()?.sanity?.dataset ?? process.env.SANITY_STUDIO_API_APIDATASET,
    apiVersion: functions.config()?.sanity?.version ?? process.env.SANITY_STUDIO_API_VERSION,
    token: functions.config()?.sanity?.token ?? process.env.SANITY_API_TOKEN,
    useCdn: false
})

export default sanityClient