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
const POST_COMMENT = {
    members: `
          _id,
          author->,
          recipient->,
          publishedAt,
          body,
`,
    type: "PostComment"
}
const POST = {
    members: `
          _id,
          author->,
          publishedAt,
          body,
          mainImage
`,
    type: "Post"
}
const BUG_REPORT = {
    members: `
          _id,
          submittedBy->,
          publishedAt,
          body,
          title
`,
    type: "BugReport"
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
const COMMENT_THREAD = {
    members: `
          _id,
          source->,
          "theComments": theComments[]->,
`,
    type: "CommentThread"
}
const POSITION = {
    members: `
        _id,
        userRef->,
        longitude,
        latitude,
        timestamp,
        accuracy,
        altitude,
        heading,
        speed,
        speedAccuracy,
        floor,
`,
    type: "Position"
}
const HASH_TAG = {
    members: `
        _id,
        tag,
`,
    type: "Hashtag"
}
const HASH_TAG_RELATIONSHIP = {
    members: `
        _id,
        hashtagRef->,
        hashtaggedDocumentRef->,
`,
    type: "HashtagRelation"
}

export default {
    POST_COMMENT,
    COMMENT_THREAD,
    BUG_REPORT,
    EXT_PROFILE,
    USER,
    LIKE,
    COMMENT,
    FOLLOW,
    BLOCK,
    TIMELINE_EVENT,
    POST,
    POSITION,
    HASH_TAG,
    HASH_TAG_RELATIONSHIP,
}