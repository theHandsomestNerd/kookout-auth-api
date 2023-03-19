export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
    },
    {
      name: 'displayName',
      title: 'Display Name',
      type: 'string',
    },
    {
      name: 'userId',
      title: 'User Id',
      type: 'string',
    },
    {
      name: 'profileImage',
      title: 'Profile Image',
      type: 'image',
    },
    {
      name: 'loginProviders',
      title: 'Login Providers',
      type: 'array',
      of: [{ type: 'firebaseTwitterProvider' }],
    },
  ],
  preview: {
    select: {
      title: 'userId',
      subtitle: 'email',
      media: 'profileImage'
    },
  },
};
