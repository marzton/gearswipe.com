type ValidationRule = {
  required(): ValidationRule
  unique(): ValidationRule
}

type ProductPreviewSelection = {
  title?: string
  sku?: string
  image?: unknown
}

const product = {
  name: 'product',
  title: 'Products',
  type: 'document',
  fields: [
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required().unique(),
    },
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    },
    {
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      options: {
        list: [
          { title: 'Standard', value: 'standard' },
          { title: 'Custom PC Build', value: 'custom_pc' },
          { title: 'Configured', value: 'configured' },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'PC Builds', value: 'pc_builds' },
          { title: 'Antivirus & Software', value: 'antivirus_software' },
          { title: 'Digital Items', value: 'digital_items' },
          { title: 'Components', value: 'components' },
        ],
      },
    },
    {
      name: 'subcategories',
      title: 'Subcategories',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        {
          name: 'basePrice',
          title: 'Base Price',
          type: 'number',
        },
        {
          name: 'salePrice',
          title: 'Sale Price',
          type: 'number',
        },
        {
          name: 'margin',
          title: 'Margin %',
          type: 'number',
        },
      ],
    },
    {
      name: 'heroImage',
      title: 'Hero Image',
      type: 'image',
      options: {
        hotspot: true,
      },
      description: 'Must have approved asset license',
    },
    {
      name: 'relatedImages',
      title: 'Related Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
        },
      ],
    },
    {
      name: 'vendor',
      title: 'Primary Vendor',
      type: 'reference',
      to: [{ type: 'vendor' }],
    },
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
    },
  ],
  preview: {
    select: {
      title: 'name',
      sku: 'sku',
      image: 'heroImage',
    },
    prepare(selection: ProductPreviewSelection) {
      return {
        title: `${selection.sku} - ${selection.title}`,
        media: selection.image,
      }
    },
  },
}

export default product
