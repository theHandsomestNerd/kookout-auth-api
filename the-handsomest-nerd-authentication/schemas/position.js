export default {
    name: 'Position',
    title: 'Position',
    type: 'document',
    fields: [
        {
            name: 'longitude',
            title: 'Longitude',
            type: 'string',
        },
        {
            name: 'latitude',
            title: 'Latitude',
            type: 'string',
        },
        {
            name: 'timestamp',
            title: 'Timestamp',
            type: 'string',
        },
        {
            name: 'accuracy',
            title: 'Accuracy',
            type: 'string',
        },
        {
            name: 'altitude',
            title: 'Altitude',
            type: 'string',
        },
        {
            name: 'heading',
            title: 'Heading',
            type: 'string',
        },
        {
            name: 'userRef',
            title: 'User',
            type: 'reference',
            to: { type: 'user' },
        },
        {
            name: 'speed',
            title: 'Speed',
            type: 'string',
        },

        {
            name: 'speedAccuracy',
            title: 'Speed Accuracy',
            type: 'string',
        },

        {
            name: 'floor',
            title: 'Floor',
            type: 'string',
        },

    ],
    preview: {
        select: {
            title: 'userRef.userId',
            subtitle: 'timestamp',
            media: 'userRef.profileImage'
        },
    },
};
