export default {
    name: 'TimelineEvent',
    title: 'Timeline Event',
    type: 'document',
    fields: [
        {
            name: 'isPublic',
            title: 'Is this Public Notification?',
            type: 'boolean',
        },
        {
            name: 'actor',
            title: 'Actor',
            type: 'reference',
            to: [{type: "user", title: "User"}]
        },
        {
            name: 'action',
            title: 'Action',
            type: 'string',
            options: {
                list: [
                    {title: 'Registered', value: 'REGISTERED'},
                    {title: 'Followed', value: 'FOLLOWED'},
                    {title: 'UnFollowed', value: 'UNFOLLOWED'},
                    {title: 'Unliked', value: 'UNLIKED'},
                    {title: 'Liked', value: 'LIKED'},
                    {title: 'Commented', value: 'COMMENTED'},
                    {title: 'Posted', value: 'POSTED'},
                ],
            },
        },
        {
            name: 'recipient',
            title: 'Recipient',
            type: 'reference',
            to: [{type: "user", title: "User"}]
        },
        {
            name: 'item',
            title: 'Item',
            type: 'reference',
            to: [
                {type: "Like", title: "Like"},
                {type: "Comment", title: "Comment"},
                {type: "Follow", title: "Follow"},
                {type: "Post", title: "Post"},
                {type: "user", title: "User"}
            ]
        },

    ],
    preview: {
        select: {
            title: 'actor._id',
            media: 'recipient.profileImage',
            subtitle: 'action'
        },
    },
};
