const EXT_PROFILE = {
    members: `
          _id,
          age,
          userId,
          weight,
          height,
          gender,
          shortBio,
          longBio,
          facebook,
          twitter,
          instagram,
          partnerStatus,
          ethnicity,
          iAm,
          imInto,
          imOpenTo,
          whatIDo,
          whatImLookingFor,
          whatInterestsMe,
          whereILive,
          sexPreference,
          nsfwFriendly,
          isTraveling,
          hivStatus,
          lastTested,
          "pronouns": pronouns[],
          "hashtags": hashtags[],
`,
    type: "ExtendedProfile"
}
const USER = {
    members: `
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
`,
    type: "user"
}

export default {EXT_PROFILE, USER}