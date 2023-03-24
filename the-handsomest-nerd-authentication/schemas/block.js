export default {
  name: 'Block',
  title: 'Block',
  type: 'document',
  fields: [
    {
      name: 'blocker',
      title: 'Blocker',
      type: 'reference',
      to: [{type:"user", title: "User"}]
    },
    {
      name: 'blocked',
      title: 'Blocked',
      type: 'reference',
      to: [{type:"user", title: "User"}]
    },
  ],
  preview: {
    select: {
      title: 'blocked._id',
      media: 'blocked.profileImage',
      subtitle: 'blocker._id'
    },
  },
};
