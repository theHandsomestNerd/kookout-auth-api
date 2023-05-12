// First, we must import the schema creator
import createSchema from 'part:@sanity/base/schema-creator'

// Then import schema types from any plugins that might expose them
import schemaTypes from 'all:part:@sanity/base/schema-type'
import user from "./authentication/user";
import firebaseTwitterProvider from "./authentication/firebaseTwitterProvider";
import ExtendedProfile from "./extendedProfile";
import Like from "./like";
import Category from "./category";
import Post from "./post";
import Comment from "./comment";
import Follow from "./follow";
import TimelineEvent from "./timelineEvent";
import Block from "./block";
import PhotoAlbum from "./photoAlbum";
import AlbumImage from "./albumImage";
import BugReport from "./bug-report/bugReport";
import CommentThread from "./commentThread";
import PostComment from "./postComment";
import Position from "./position";
import HashTag from "./hashtag/hashTag";
import HashTagRelations from "./hashtag/hashTagRelations";
import HashTagCollection from "./hashtag/hashTagCollection";
import csvToProcess from "./csv/csvToProcess";
import csvToProcessFile from "./csv/csvToProcessFile";
import spreadsheetMember from "./spreadsheetMember";
import spreadsheetMemberRelation from "./spreadsheetMemberRelation";

// Then we give our schema to the builder and provide the result to Sanity
export default createSchema({
    // We name our schema
    name: 'default',
    // Then proceed to concatenate our document type
    // to the ones provided by any plugins that are installed
    types: schemaTypes.concat([
        /* Your types here! */
        user,
        ExtendedProfile,
        Like,
        Category,
        Comment,
        Follow,
        TimelineEvent,
        Block,
        Post,
        PhotoAlbum,
        AlbumImage,
        BugReport,
        firebaseTwitterProvider,
        CommentThread,
        PostComment,
        Position,
        HashTag,
        HashTagRelations,
        HashTagCollection,
        csvToProcess,
        csvToProcessFile,
        spreadsheetMember,
        spreadsheetMemberRelation
    ]),
})
