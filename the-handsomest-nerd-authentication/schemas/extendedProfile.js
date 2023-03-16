export default {
  name: 'ExtendedProfile',
  title: 'Extended Profile',
  type: 'document',
  fields: [
    {
      name: 'age',
      title: 'Age',
      type: 'number',
    },
    {
      name: 'weight',
      title: 'Weight',
      type: 'number',
    },
    {
      name: 'height',
      title: 'Height',
      type: 'object',
      fields: [
        {
          name: 'feet',
          title: 'Feet',
          type: 'number',
        },
        {
          name: 'inches',
          title: 'Inches',
          type: 'number',
        },
      ],
    },
    {
      name: 'gender',
      title: 'Gender',
      type: 'string',
    },
    {
      name: 'partnerStatus',
      title: 'Partner Status',
      type: 'string',
    },
    {
      name: 'pronouns',
      title: 'Pronouns',
      type: 'array',
      of:[{type: 'string'}]
    },
    {
      name: 'hashtags',
      title: 'Hashtags',
      type: 'array',
      of:[{type: 'string'}]
    },
    {
      name: 'ethnicity',
      title: 'Ethnicity',
      type: 'string',
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string',
    },
    {
      name: 'shortBio',
      title: 'Short Bio',
      type: 'text',
    },
    {
      name: 'longBio',
      title: 'Long Bio',
      type: 'text',
    },
    {
      name: 'iAm',
      title: 'I am',
      type: 'text',
    },
    {
      name: 'imInto',
      title: 'Im Into',
      type: 'text',
    },
    {
      name: 'imOpenTo',
      title: 'Im Into',
      type: 'text',
    },
    {
      name: 'whatIDo',
      title: 'What I do',
      type: 'text',
    },
    {
      name: 'whatImLookingFor',
      title: 'What Im Looking for',
      type: 'text',
    },
    {
      name: 'whatInterestsMe',
      title: 'What Interests Me',
      type: 'text',
    },
    {
      name: 'whereILive',
      title: 'Where I Live',
      type: 'text',
    },
    {
      name: 'sexPreferences',
      title: 'Sex Preferences',
      type: 'text',
    },
     {
      name: 'nsfwFriendly',
      title: 'NSFW Friendly',
      type: 'boolean',
    },
    {
      name: 'isTraveling',
      title: 'is Traveling?',
      type: 'boolean',
    },
    {
      name: 'hivStatus',
      title: 'HIV Status',
      type: 'string',
    },
    {
      name: 'lastTested',
      title: 'Last Tested Date',
      type: 'date',
    },
    {
      name: 'facebook',
      title: 'Facebook Handle',
      type: 'string',
    },
    {
      name: 'instagram',
      title: 'IG Handle',
      type: 'string',
    },
    {
      name: 'twitter',
      title: 'Twitter Handle',
      type: 'string',
    },
  ],
  preview: {
    select: {
      title: 'userId',
    },
  },
};
