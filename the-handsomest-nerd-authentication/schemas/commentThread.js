export default {
  name: 'CommentThread',
  title: 'Comment Thread',
  type: 'document',
  fields: [
    {
      name: 'sourceOfCommentThread',
      title: 'Source of Thread',
      type: 'reference',
      to: [{type: "Post", title: "Post"}]
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'theComments',
      title: 'The Comments',
      type: 'array',
      of:[{type: 'PostComment'}]
    },
  ],
  preview: {
    select: {
      title: 'sourceOfCommentThread.body',
      subtitle: 'theComments.length',
      media: 'sourceOfCommentThread.mainImage'
    },
  },
};
