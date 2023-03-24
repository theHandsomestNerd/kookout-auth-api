export default {
  name: 'Like',
  title: 'Like',
  type: 'document',
  fields: [
    {
      name: 'liker',
      title: 'Liker',
      type: 'reference',
      to: [{type:"user", title: "User"}]
    },
    {
      name: 'likee',
      title: 'Likee',
      type: 'reference',
      to: [{type:"user", title: "User"}]
    },
    {
      name: 'likeCategory',
      title: 'Like Category?',
      type: 'string',
      options: {
        list: [
          { title: 'Profile Like', value: 'profile-like' },
          { title: 'Comment Like', value: 'comment-like' },
          { title: 'Photo Like', value: 'photo-like' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'likee._id',
      media: 'likee.profileImage',
      subtitle: 'liker._id'
    },
  },
};
