export default {
    name: 'Hashtag',
    title: 'Hashtag',
    type: 'document',
    fields: [
        {
            name: 'tag',
            title: 'Tag',
            type: 'string',
        },
    ],
    preview: {
        select: {
            title: 'tag',
        },
    },
};
