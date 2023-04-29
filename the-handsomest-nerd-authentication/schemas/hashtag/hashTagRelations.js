export default {
    name: 'HashtagRelation',
    title: 'Hashtag Relation',
    type: 'document',
    fields: [
        {
            name: 'hashtagRef',
            title: 'Hashtag',
            type: 'reference',
            to: [{type:"Hashtag", title: "Hashtag"}]
        },
        {
            name: 'hashtaggedDocumentRef',
            title: 'Hashtagged Document',
            type: 'reference',
            to: [{type:"Post", title: "Post"}]
        },
    ],
    preview: {
        select: {
            title: `hashtagRef.tag`,
            subtitle: 'hashtaggedDocumentRef.body',
            media: 'hashtaggedDocumentRef.mainImage'
        },
    },
};
