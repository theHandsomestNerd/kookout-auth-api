export default {
    name: 'BugReport',
    title: 'Bug Report',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Title',
            type: 'string',
        },
        {
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: (thisBug) => {
                    return thisBug.title;
                },
                maxLength: 96,
            },
        },
        {
            name: 'submittedBy',
            title: 'Submitted By',
            type: 'reference',
            to: {type: 'user'},
        },
        {
            name: 'mainImage',
            title: 'Main image',
            type: 'image',
            options: {
                hotspot: true,
            },
        },
        {
            name: 'categories',
            title: 'Categories',
            type: 'array',
            of: [{type: 'reference', to: {type: 'Category'}}],
            options: {layout: 'tags'},
        },
        {
            name: 'publishedAt',
            title: 'Published at',
            type: 'datetime',
        },
        {
            name: 'body',
            title: 'Body',
            type: 'text',
        },
        {
            name: 'uiVersion',
            title: 'UI Version',
            type: 'string',
        },
        {
            name: 'apiVersion',
            title: 'API Version',
            type: 'string',
        },
        {
            name: 'uiSanityDB',
            title: 'UI Sanity DB env',
            type: 'string',
        },
        {
            name: 'apiSanityDB',
            title: 'API Sanity DB env',
            type: 'string',
        },
    ],

    preview: {
        select: {
            title: 'title',
            author: 'author.name',
            media: 'mainImage',
        },
        prepare(selection) {
            const {author} = selection;
            return {...selection, subtitle: author && `by ${author}`};
        },
    },
};
