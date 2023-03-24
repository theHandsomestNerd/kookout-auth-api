export default {
  name: 'PhotoAlbum',
  title: 'Photo Album',
  type: 'document',
  fields: [
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of:[{type: 'AlbumImage'}]
    },
    {
      name: 'name',
      title: 'Name',
      type: 'string',
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
      media: 'images[0].imageSrc'
    },
  },
};
