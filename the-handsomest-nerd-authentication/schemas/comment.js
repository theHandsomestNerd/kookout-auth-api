export default {
    name: 'Comment',
    title: 'Comment',
    type: 'document',
    fields: [
        {
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: {type: 'user'},
        },
        {
            name: 'recipient',
            title: 'Recipient',
            type: 'reference',
            to: {type: 'user'},
        },
        {
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        },
        {
            name: 'body',
            title: 'Body',
            type: 'string',
        },
    ],

    preview: {
        select: {
            title: 'author.displayName',
            media: 'author.profileImage',
            subtitle: 'recipient._id'
        },
    },
};
