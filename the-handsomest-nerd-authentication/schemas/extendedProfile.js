export default {
    name: 'ExtendedProfile',
    title: 'Extended Profile',
    type: 'document',
    fields: [
        {
            name: 'facebook',
            title: 'Facebook Handle',
            type: 'string',
        },
        {
            name: 'instagram',
            title: 'IG Handle',
            type: 'string',
        },
        {
            name: 'twitter',
            title: 'Twitter Handle',
            type: 'string',
        },
        {
            name: 'tiktok',
            title: 'Tik-Tok',
            type: 'string',
        },
        {
            name: 'homePhone',
            title: 'Home Phone',
            type: 'string',
        },
        {
            name: 'workPhone',
            title: 'Work Phone',
            type: 'string',
        },
        {
            name: 'cellPhone',
            title: 'Cell Phone',
            type: 'string',
        },
        {
            name: 'address1',
            title: 'Address Line 1',
            type: 'string',
        },
        {
            name: 'address2',
            title: 'Address Line 2',
            type: 'string',
        },
        {
            name: 'city',
            title: 'City',
            type: 'string',
        },
        {
            name: 'state',
            title: 'State',
            type: 'string',
        },
        {
            name: 'zip',
            title: 'Zip',
            type: 'string',
        },
        {
            name: 'age',
            title: 'Age',
            type: 'number',
        },
        {
            name: 'weight',
            title: 'Weight',
            type: 'number',
        },
        {
            name: 'height',
            title: 'Height',
            type: 'object',
            fields: [
                {
                    name: 'feet',
                    title: 'Feet',
                    type: 'number',
                },
                {
                    name: 'inches',
                    title: 'Inches',
                    type: 'number',
                },
            ],
        },
        {
            name: 'userId',
            title: 'User ID',
            type: 'string',
        },
        {
            name: 'userRef',
            title: 'User Ref',
            type: 'reference',
            to: [{type: 'user'}]
        },
        {
            name: 'govtIssuedFirstName',
            title: 'Your first name',
            type: 'text',
        },
        {
            name: 'govtIssuedMiddleName',
            title: 'Your Middle name',
            type: 'text',
        },
        {
            name: 'govtIssuedLastName',
            title: 'Your Last name',
            type: 'text',
        },
        {
            name: 'dob',
            title: 'Date of Birth',
            type: 'date',
        },
        {
            name: 'ethnicity',
            title: 'Ethnicity',
            type: 'string',
        },
        {
            name: 'occupation',
            title: 'Occupation',
            type: 'string',
        },
        {
            name: 'lineNumber',
            title: 'Line Number',
            type: 'number',
        },
        {
            name: 'crossingDate',
            title: 'Crossing Date',
            type: 'date',
        },
        {
            name: 'otherChapterAffiliation',
            title: 'Other Chapter Affiliation',
            type: 'string',
        },
        {
            name: 'lineName',
            title: 'Your Individual Line Name',
            type: 'text',
        },
        {
            name: 'entireLinesName',
            title: 'Your Entire Lines Name',
            type: 'text',
        },
        {
            name: 'dopName',
            title: 'Your Deans Name',
            type: 'text',
        },
        {
            name: 'shortBio',
            title: 'Short Bio',
            type: 'text',
        },
        {
            name: 'longBio',
            title: 'Long Bio',
            type: 'text',
        },
        {
            name: 'spouse',
            title: 'Spouse',
            type: 'string',
        },
        {
            name: 'children',
            title: 'Children',
            type: 'array',
            of: [{type: 'string'}]
        },
    ],
    preview: {
        select: {
            title: 'userRef._id',
            media: 'userRef.profileImage',
        },
    },
};
