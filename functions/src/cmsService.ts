import cmsClient from "./cmsClient";
import timelineClient from "./timelineClient";
import LIKE_CATEGORY_ENUM from "./LikeCategoryEnum";
import {SanityPosition} from "../types";


const createLike = async (likerUserId: string, likeeId: string, likeType: LIKE_CATEGORY_ENUM) => {
    var createdLike = await cmsClient.createLike(likerUserId, likeeId, likeType);
    await timelineClient.likeCreated(createdLike);
    return createdLike;
}
const createPosition = async (userId: string, position: SanityPosition) => {
    var createdPosition = await cmsClient.createPosition(userId, position);
    // await timelineClient.likeCreated(createdLike);
    return createdPosition;
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

const createProfileComment = async (commenterUserId: string, profileUserId: string, commentType: string, commentBody: string) => {
    var createdComment = commentType == 'profile-comment' ? await cmsClient.createProfileComment(commenterUserId, profileUserId, commentBody) : await cmsClient.createPostComment(commenterUserId, profileUserId, commentBody);
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
const fetchHashtaggedPostsPaginated = async (userId: string, hashtagId:string, pageSize: string, lastId?: string,) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return  cmsClient.fetchHashtaggedPostsPaginated(hashtagId, pageSize, lastId, blockedUserIds);
}
const fetchPostCommentsPaginated = async (userId: string, documentId: string, pageSize: number, lastId?: string,) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchPostCommentsPaginated(documentId, pageSize, lastId, blockedUserIds);
}
const fetchProfileTimelineEvents = async (userId: string) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(userId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchProfileTimelineEvents(userId, blockedUserIds);
}

const fetchProfileComments = async (typeId: string, userId: string, myUserId: string) => {
    var blockedUsers = await cmsClient.fetchBiDirectionalProfileBlocks(myUserId);

    var blockedUserIds = blockedUsers?.map((blockedUser) => {
        return blockedUser.blocked._id
    });

    return cmsClient.fetchProfileComments(typeId, userId, blockedUserIds);
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
        // create comment thread link to post
        if(postUploaded == null){
            return null;
        }
        await cmsClient.createCommentThread(postUploaded._id);

        await timelineClient.postCreated(postUploaded);

        return postUploaded
    }
    return Promise.reject(Error("no userId"))
}

const createOrNotHashtags = async (hashtags: string[], postId: string) => {
    var sanityHashtagList = await Promise.all(hashtags.map(async (hashtag: string) => {
        return cmsClient.createIfHashtagNotExist(hashtag);
    }));

    return Promise.all(sanityHashtagList.map(async (hashtag) => {
        //
        // if (imageId) {
        //     // create hashtag relationship for the images
        //     return Promise.all([cmsClient.createHashtagRelationship(hashtag, postId), cmsClient.createHashtagRelationship(hashtag, imageId)]);
        // }

        // create hashtag relationship for the post
        return cmsClient.createHashtagRelationship(hashtag, postId);
    }));
}


export default {
    fetchHashtaggedPostsPaginated,
    createOrNotHashtags,
    fetchPosts,
    createPost,
    fetchProfileComments,
    fetchProfileTimelineEvents,
    createLike,
    createPosition,
    removeLike,
    removeFollow,
    createProfileComment,
    createProfileFollow,
    fetchAllUsers,
    fetchAllUsersPaginated,
    fetchAllPostsPaginated,
    fetchPostCommentsPaginated
}