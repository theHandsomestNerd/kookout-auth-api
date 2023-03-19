export default {
  name: 'firebaseTwitterProvider',
  title: 'Firebase Twitter Provider',
  type: 'object',
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
      name: 'phoneNumber',
      title: 'Phone Number',
      type: 'string',
    },
    {
      name: 'photoURL',
      title: 'Photo URL',
      type: 'string',
    },
    {
      name: 'uid',
      title: 'Twitter User ID',
      type: 'string',
    },
    {
      name: 'providerId',
      title: 'Provider Id',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'displayName',
    },
  },
};
