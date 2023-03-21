import {SanityCommentRef, SanityFollowRef, SanityLike, SanityLikeRef} from "../types";
import groqQueries from "./groqQueries";
import cmsUtils from "./cmsUtils";
import {log} from "./logClient";
import sanityClient from "./sanityClient";

enum ACTION_TYPE_ENUM {
    FOLLOWED="FOLLOWED",
    UNFOLLOWED="UNFOLLOWED",

    LIKED="LIKED",
    UNLIKED="UNLIKED",
    COMMENTED="COMMENTED",
    POSTED="POSTED"


}
const profileLikeCreated = async (likeToRecord:SanityLikeRef)=>{
        const LOG_COMPONENT = "timeline-event-like-created-"+likeToRecord.likee._ref+"-like-"+likeToRecord.likee._ref

        const newSanityDocument = {
            _type: groqQueries.TIMELINE_EVENT.type,
            isPublic: false,
            actor: likeToRecord.liker,
            action: ACTION_TYPE_ENUM.LIKED,
            recipient: likeToRecord.likee,
            item: cmsUtils.getSanityDocumentRef(likeToRecord._id),
        }

        log(LOG_COMPONENT, "INFO", "Creating timeline event for Like", newSanityDocument)

        return sanityClient.create(newSanityDocument).catch((e: any) => {
            log(LOG_COMPONENT, "ERROR", "could not create timeline event for like", { likeToRecord, e})
            return e
        })
}
const profileFollowCreated = async (followToRecord:SanityFollowRef)=>{
        const LOG_COMPONENT = "timeline-event-like-created-"+followToRecord.follower._ref+"-followed-"+followToRecord.followed._ref

        const newSanityDocument = {
            _type: groqQueries.TIMELINE_EVENT.type,
            isPublic: true,
            actor: followToRecord.follower,
            action: ACTION_TYPE_ENUM.FOLLOWED,
            recipient: followToRecord.followed,
            item: cmsUtils.getSanityDocumentRef(followToRecord._id),
        }

        log(LOG_COMPONENT, "INFO", "Creating timeline event for Follow", newSanityDocument)

        return sanityClient.create(newSanityDocument).catch((e: any) => {
            log(LOG_COMPONENT, "ERROR", "could not create timeline event for follow", { likeToRecord: followToRecord, e})
            return e
        })
}
const profileCommentCreated = async (createdComment:SanityCommentRef)=>{
        const LOG_COMPONENT = "timeline-event-comment-created-"+createdComment.author._ref+"-on-"+createdComment.recipient._ref

        const newSanityDocument = {
            _type: groqQueries.TIMELINE_EVENT.type,
            isPublic: false,
            actor: createdComment.author,
            action: ACTION_TYPE_ENUM.COMMENTED,
            recipient: createdComment.recipient,
            item: cmsUtils.getSanityDocumentRef(createdComment._id),
        }

        log(LOG_COMPONENT, "INFO", "Creating timeline event for Comment", newSanityDocument)

        return sanityClient.create(newSanityDocument).catch((e: any) => {
            log(LOG_COMPONENT, "ERROR", "could not create timeline event for comment", { createdComment, e})
            return e
        })
}


const removeLike = async (alreadyRemovedLike:SanityLike)=>{
    const LOG_COMPONENT = "timeline-event-unlike-"+alreadyRemovedLike._id

    const newSanityDocument = {
        _type: groqQueries.TIMELINE_EVENT.type,
        isPublic: false,
        actor: cmsUtils.getSanityDocumentRef(alreadyRemovedLike.liker._id),
        action: ACTION_TYPE_ENUM.UNLIKED,
        recipient: cmsUtils.getSanityDocumentRef(alreadyRemovedLike.likee._id),
        // item: ,
    }

    log(LOG_COMPONENT, "INFO", "Creating timeline event for unlike", newSanityDocument)

    return sanityClient.create(newSanityDocument).catch((e: any) => {
        log(LOG_COMPONENT, "ERROR", "could not create timeline event for unlike", { removedLike: alreadyRemovedLike, e})
        return e
    })
}
export default {profileLikeCreated, removeLike, profileCommentCreated, profileFollowCreated}