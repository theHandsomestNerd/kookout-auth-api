import cmsClient from "./cmsClient";
import timelineClient from "./timelineClient";
import LIKE_CATEGORY_ENUM from "./LikeCategoryEnum";


const createLike = async (likerUserId: string, likeeId: string, likeType: LIKE_CATEGORY_ENUM) => {
    var createdLike = await cmsClient.createLike(likerUserId, likeeId, likeType);
    await timelineClient.likeCreated(createdLike);
    return createdLike;
}

const removeLike = async (likeId: string) => {
    // find the timelines that reference this like and
    await cmsClient.fetchProfileTimelineEventsRef(likeId);
    // var deleteTimelineEventResponse = await cmsClient.removeTimelineEvents


    var removedLike = await cmsClient.fetchProfileLike(likeId);
    var removedLikeResponse = await cmsClient.removeLike(likeId);

    await timelineClient.removeLike(removedLike);
    return removedLikeResponse;
}

const removeFollow = async (followId: string) => {
    // find the timelines that reference this like and
    await cmsClient.fetchProfileTimelineEventsRef(followId);
    // var deleteTimelineEventResponse = await cmsClient.removeTimelineEvents


    var removedFollow = await cmsClient.fetchProfileFollow(followId);
    var removedFollowResponse = await cmsClient.removeFollow(followId);

    await timelineClient.removeFollow(removedFollow);
    return removedFollowResponse;
}

const createProfileComment = async (commenterUserId: string, profileUserId: string, commentBody: string) => {
    var createdComment = await cmsClient.createProfileComment(commenterUserId, profileUserId, commentBody);
    await timelineClient.profileCommentCreated(createdComment);
    return createdComment;
}

const createProfileFollow = async (followerUserId: string, followedUserId: string) => {
    var createdFollow = await cmsClient.createProfileFollow(followerUserId, followedUserId);
    await timelineClient.profileFollowCreated(createdFollow);
    return createdFollow;
}

const fetchAllUsers = async (userId: string) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchAllUsers(blockedUserIds);
}
const fetchAllUsersPaginated = async (userId: string, pageSize: number, lastId?: string,) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchAllUsersPaginated(pageSize, lastId, blockedUserIds);
}
const fetchAllPostsPaginated = async (userId: string, pageSize: number, lastId?: string,) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchAllPostsPaginated(pageSize, lastId, blockedUserIds);
}
const fetchProfileTimelineEvents = async (userId: string) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchProfileTimelineEvents(userId, blockedUserIds);
}

const fetchProfileComments = async (userId: string, myUserId: string) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(myUserId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchProfileComments(userId, blockedUserIds);
}
const fetchPosts = async (myUserId: string) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(myUserId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchPosts(blockedUserIds);
}

const createPost = async (imageFile?: any, userId?: string, postBody?: string) => {
    if (userId) {
        // if (imageFile.filepath) {
        const postUploaded = await cmsClient.uploadUserPost(imageFile?.filepath, userId, postBody)
        await timelineClient.postCreated(postUploaded);

        return postUploaded
    }
    return Promise.reject(Error("no userId"))
}

export default {
    fetchPosts,
    createPost,
    fetchProfileComments,
    fetchProfileTimelineEvents,
    createLike,
    removeLike,
    removeFollow,
    createProfileComment,
    createProfileFollow,
    fetchAllUsers,
    fetchAllUsersPaginated,
    fetchAllPostsPaginated
}