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
      Post,
      firebaseTwitterProvider
  ]),
})
