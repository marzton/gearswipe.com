export default {
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Site Title',
      type: 'string',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Site Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'logo',
      title: 'Logo',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'favicon',
      title: 'Favicon',
      type: 'image',
    },
    {
      name: 'navigation',
      title: 'Navigation Menu',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'label',
              type: 'string',
              title: 'Label',
            },
            {
              name: 'slug',
              type: 'slug',
              title: 'Link',
              options: { source: 'label' },
            },
          ],
        },
      ],
    },
    {
      name: 'footer',
      title: 'Footer',
      type: 'object',
      fields: [
        {
          name: 'text',
          type: 'text',
          title: 'Footer Text',
        },
        {
          name: 'links',
          type: 'array',
          title: 'Footer Links',
          of: [
            {
              type: 'object',
              fields: [
                {
                  name: 'label',
                  type: 'string',
                  title: 'Label',
                },
                {
                  name: 'url',
                  type: 'url',
                  title: 'URL',
                },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'socialLinks',
      title: 'Social Links',
      type: 'object',
      fields: [
        {
          name: 'twitter',
          type: 'url',
          title: 'Twitter',
        },
        {
          name: 'github',
          type: 'url',
          title: 'GitHub',
        },
        {
          name: 'linkedin',
          type: 'url',
          title: 'LinkedIn',
        },
        {
          name: 'instagram',
          type: 'url',
          title: 'Instagram',
        },
      ],
    },
  ],
}
