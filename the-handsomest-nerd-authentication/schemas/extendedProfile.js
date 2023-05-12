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
            name: 'userId',
            title: 'User ID',
            type: 'string',
        },
        {
            name: 'userRef',
            title: 'User Ref',
            type: 'reference',
            to: [{type: 'user'}]
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
    ],
    preview: {
        select: {
            title: 'userRef._id',
            media: 'userRef.profileImage',
        },
    },
};
