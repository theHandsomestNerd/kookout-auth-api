export default {
  name: 'Category',
  title: 'Category',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Title',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
    },
    {
      title: 'Color',
      description: 'Pick a color',
      name: 'color',
      type: 'colorlist', // required
      options: {
        list: [
          { title: '#3D3D3D', value: '#3D3D3D' },
          { title: 'rgba(75,75,229,1)', value: 'rgba(75,75,229,1)' },
          { title: 'rgba(75,135,75,1)', value: 'rgba(75,135,75,1)' },
          { title: 'rgba(75,135,135,1)', value: 'rgba(75,135,135,1)' },
          { title: 'rgba(135,135,75,1)', value: 'rgba(135,135,75,1)' },
          { title: 'rgba(135,75,135,1)', value: 'rgba(135,75,135,1)' },
        ],
      },
    },
  ],
};
