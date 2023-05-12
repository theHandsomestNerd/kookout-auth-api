const EXT_PROFILE = {
    members: `
          _id,
          userId,
          userRef->,
          facebook,
          twitter,
          instagram,
          ethnicity,
          age,
          weight,
          height,
          shortBio,
          longBio,
          "children": children[],
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
        slug,
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
const SPREADSHEET_RELATIONSHIP = {
    members: `
        _id,
        spreadsheetMemberRef->,
        userRef->,
        isApproved,
`,
    type: "SpreadsheetMemberRelation"
}
const HASH_TAG_COLLECTION = {
    members: `
          _id,
          name,
          slug,
          description,
          "theTags": theTags[]->,
`,
    type: "HashtagCollection"
}
const SPREADSHEET_MEMBER = {
    members: `
          ...
`,
    type: "spreadsheetMember"
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
    SPREADSHEET_RELATIONSHIP,
    HASH_TAG_COLLECTION,
    SPREADSHEET_MEMBER
}