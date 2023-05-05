export default {
    name: 'csvToProcessFile',
    title: 'CSVs To Be Processed',
    type: 'file',
    fields: [
        {
            name: 'objectType',
            title: 'Sanity Object Type to Create',
            type: 'string',
            options: {
                list: [{ title: 'Theta Chi Member from Spreadsheet', value: 'spreadsheetMember' }],
            },
        },
    ],
};