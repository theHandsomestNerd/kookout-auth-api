export default {
  name: 'AlbumImage',
  title: 'Album Image',
  type: 'document',
  fields: [
    {
      name: 'imageSrc',
      title: 'Image Source',
      type: 'image',
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
    },
    {
      name: 'isPublic',
      title: 'Is Public',
      type: 'boolean',
    },
    {
      name: 'userRef',
      title: 'User Ref',
      type: 'reference',
      to: [{type:"user"}]
    },

  ],
  preview: {
    select: {
      title: 'userRef.userId',
      subtitle: 'name',
      media: 'imageSrc'
    },
  },
};
