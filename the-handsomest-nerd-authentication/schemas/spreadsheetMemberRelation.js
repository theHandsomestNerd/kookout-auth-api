export default {
    name: 'SpreadsheetMemberRelation',
    title: 'Spreadsheet Member Relation',
    type: 'document',
    fields: [
        {
            name: 'spreadsheetMemberRef',
            title: 'Member from Roster',
            type: 'reference',
            to: [{type:"spreadsheetMember", title: "Roster Member"}]
        },
        {
            name: 'userRef',
            title: 'User',
            type: 'reference',
            to: [{type:"user", title: "User"}]
        },
        {
            name: 'isApproved',
            title: 'Approved?',
            type: 'boolean',
        },

    ],
    preview: {
        select: {
            title: `spreadsheetMemberRef.slug.current`,
            subtitle: 'userRef._id',
            media: 'userRef.profileImage'
        },
    },
};
