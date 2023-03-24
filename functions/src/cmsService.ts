import cmsClient from "./cmsClient";
import timelineClient from "./timelineClient";


const createProfileLike = async (likerUserId: string, likeeUserId: string) => {
    var createdLike = await cmsClient.createProfileLike(likerUserId, likeeUserId);
    await timelineClient.profileLikeCreated(createdLike);
    return createdLike;
}

const removeLike = async (likeId: string) => {
    var removedLike = await cmsClient.fetchProfileLike(likeId);
    var removedLikeResponse = await cmsClient.removeLike(likeId);

    await timelineClient.removeLike(removedLike);
    return removedLikeResponse;
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

const fetchAllUsers = async (userId:string) =>{
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser)=>{
        return blockedUser.blocked._id
    });

    return cmsClient.fetchAllUsers(blockedUserIds);
}
const fetchProfileTimelineEvents = async (userId:string) =>{
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser)=>{
        return blockedUser.blocked._id
    });

    return cmsClient.fetchProfileTimelineEvents(userId,blockedUserIds);
}

const fetchProfileComments = async (userId:string, myUserId:string) =>{
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(myUserId);

    var blockedUserIds = blockedUsers?.map((blockedUser)=>{
        return blockedUser.blocked._id
    });

    return cmsClient.fetchProfileComments(userId,blockedUserIds);
}

export default {fetchProfileComments,fetchProfileTimelineEvents, createProfileLike,removeLike, createProfileComment, createProfileFollow, fetchAllUsers}