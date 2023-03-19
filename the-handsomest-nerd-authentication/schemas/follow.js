export default {
  name: 'Follow',
  title: 'Follow',
  type: 'document',
  fields: [
    {
      name: 'follower',
      title: 'Follower',
      type: 'reference',
      to: [{type:"user", title: "User"}]
    },
    {
      name: 'followed',
      title: 'Followed',
      type: 'reference',
      to: [{type:"user", title: "User"}]
    },
  ],
  preview: {
    select: {
      title: 'followed._id',
    },
  },
};
