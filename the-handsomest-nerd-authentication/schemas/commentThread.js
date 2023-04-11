export default {
  name: 'CommentThread',
  title: 'Comment Thread',
  type: 'document',
  fields: [
    {
      name: 'source',
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
  // preview: {
  //   select: {
  //     title: 'userRef.userId',
  //     subtitle: 'name',
  //     media: 'images[0].imageSrc'
  //   },
  // },
};
