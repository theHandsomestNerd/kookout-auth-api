const EXT_PROFILE = {
    members: `
          _id,
          age,
          userId,
          userRef->,
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
          sexPreferences,
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

const LIKE = {
    members: `
          _id,
          likee->,
          liker->,
          likeCategory,
`,
    type: "Like"
}
const BLOCK = {
    members: `
          _id,
          blocker->,
          blocked->,
`,
    type: "Block"
}
const FOLLOW = {
    members: `
          _id,
          follower->,
          followed->
`,
    type: "Follow"
}
const COMMENT = {
    members: `
          _id,
          author->,
          recipient->,
          publishedAt,
          body,
`,
    type: "Comment"
}
const POST = {
    members: `
          _id,
          author->,
          publishedAt,
          body,
          mainImage->
`,
    type: "Post"
}
const TIMELINE_EVENT = {
    members: `
          _id,
          isPublic,
          actor->,
          action,
          recipient->,
          item->,
`,
    type: "TimelineEvent"
}

export default {EXT_PROFILE, USER, LIKE, COMMENT, FOLLOW, BLOCK, TIMELINE_EVENT, POST}