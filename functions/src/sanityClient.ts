// eslint-disable-next-line @typescript-eslint/no-var-requires
const client = require("@sanity/client")

const sanityClient = client({
    projectId: process.env.SANITY_STUDIO_API_PROJECT_ID ?? "dhhk6mar",
    dataset: process.env.SANITY_STUDIO_API_APIDATASET,
    apiVersion: process.env.SANITY_STUDIO_API_VERSION ?? "2021-03-25",
    token: process.env.SANITY_API_TOKEN,
    useCdn: false
})

export default sanityClient