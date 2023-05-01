export default {
    name: 'HashtagCollection',
    title: 'Hashtag Collection',
    type: 'document',
    fields: [
        {
            name: 'name',
            title: 'Name',
            type: 'string',
        },
        {
            name: 'description',
            title: 'Description',
            type: 'text',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: (thisPost) => {
                    return thisPost.name;
                },
                maxLength: 96,
            },
        },
        {
            name: 'theTags',
            title: 'The Tags',
            type: 'array',
            of:[{type: 'reference', to:{type:"Hashtag"}}]
        },
    ],
    preview: {
        select: {
            title: 'name',
            subtitle: 'theTags.length'
        },
    },
};
