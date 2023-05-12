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
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: (tag) => {
                    return tag.tag;
                },
                maxLength: 96,
            },
        },
    ],
    preview: {
        select: {
            title: 'tag',
        },
    },
};
