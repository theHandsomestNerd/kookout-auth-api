export default {
    name: 'PostComment',
    title: 'Post Comment',
    type: 'document',
    fields: [
        {
            name: 'author',
            title: 'Author',
            type: 'reference',
            to: {type: 'user', title: "User"},
        },
        {
            name: 'recipient',
            title: 'Recipient',
            type: 'reference',
            to: {type: 'Post'},
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
