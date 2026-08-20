type ValidationRule = {
  required(): ValidationRule
}

type AssetPreviewSelection = {
  media?: unknown
  title?: string
  status?: string
}

type AssetHiddenContext = {
  parent?: {
    attributionRequired?: boolean
  }
}

const asset = {
  name: 'asset',
  title: 'Product Assets & Licensing',
  type: 'document',
  fields: [
    {
      name: 'asset',
      title: 'Asset',
      type: 'image',
      options: {
        hotspot: true,
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'assetType',
      title: 'Asset Type',
      type: 'string',
      options: {
        list: [
          { title: 'Hero Render', value: 'hero_render' },
          { title: 'Product Photo', value: 'product_photo' },
          { title: 'Component View', value: 'component_view' },
          { title: 'Internal Build', value: 'internal_build' },
          { title: 'Detail Macro', value: 'detail_macro' },
          { title: 'Configuration Variant', value: 'configuration_variant' },
          { title: 'Brand Asset', value: 'brand_asset' },
          { title: 'Actual Item Photo', value: 'actual_item_photo' },
          { title: 'Customer Delivery', value: 'customer_delivery' },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'provenance',
      title: 'Provenance',
      type: 'object',
      fields: [
        {
          name: 'source',
          title: 'Source',
          type: 'string',
          options: {
            list: [
              { title: 'Original Photography', value: 'original' },
              { title: 'Vendor/Manufacturer', value: 'vendor' },
              { title: 'Stock Media', value: 'stock' },
              { title: 'AI Generated', value: 'ai_generated' },
              { title: 'Customer Submitted', value: 'customer' },
            ],
          },
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'creator',
          title: 'Creator/Owner',
          type: 'string',
        },
        {
          name: 'originalUrl',
          title: 'Original URL',
          type: 'url',
        },
        {
          name: 'acquisitionDate',
          title: 'Acquisition Date',
          type: 'datetime',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
      ],
    },
    {
      name: 'licensing',
      title: 'Licensing Information',
      type: 'object',
      fields: [
        {
          name: 'licenseType',
          title: 'License Type',
          type: 'string',
          options: {
            list: [
              { title: 'Proprietary', value: 'proprietary' },
              { title: 'CC BY', value: 'cc_by' },
              { title: 'CC BY-SA', value: 'cc_by_sa' },
              { title: 'Public Domain', value: 'public_domain' },
              { title: 'Vendor Specific', value: 'vendor_specific' },
            ],
          },
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'allowedUses',
          title: 'Allowed Uses',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'e.g. commercial, resale, derivative works',
        },
        {
          name: 'attributionRequired',
          title: 'Attribution Required',
          type: 'boolean',
        },
        {
          name: 'attributionText',
          title: 'Attribution Text',
          type: 'string',
        hidden: ({ parent }: AssetHiddenContext) => !parent?.attributionRequired,
        },
        {
          name: 'restrictedGeographies',
          title: 'Geographic Restrictions',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'Leave empty if no restrictions',
        },
        {
          name: 'restrictedChannels',
          title: 'Channel Restrictions',
          type: 'array',
          of: [{ type: 'string' }],
          description: 'e.g. no marketplaces, web only',
        },
        {
          name: 'expirationDate',
          title: 'License Expiration Date',
          type: 'datetime',
        },
      ],
    },
    {
      name: 'linkedProducts',
      title: 'Linked Products',
      type: 'array',
      of: [
        {
          type: 'reference',
          to: [{ type: 'product' }],
        },
      ],
    },
    {
      name: 'status',
      title: 'Approval Status',
      type: 'string',
      options: {
        list: [
          { title: 'Submitted', value: 'submitted' },
          { title: 'Rights Unknown', value: 'rights_unknown' },
          { title: 'Source Verified', value: 'source_verified' },
          { title: 'License Reviewed', value: 'license_reviewed' },
          { title: 'Approved', value: 'approved' },
          { title: 'Published', value: 'published' },
          { title: 'Expiring Soon', value: 'expiring' },
          { title: 'Archived', value: 'archived' },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'statusReason',
      title: 'Status Reason/Notes',
      type: 'text',
      rows: 3,
      description: 'Explanation for rejection or review notes',
    },
    {
      name: 'approvalNotes',
      title: 'Approval Notes',
      type: 'text',
      rows: 4,
    },
    {
      name: 'generatedContent',
      title: 'Generated Content Disclosure',
      type: 'string',
      description: 'Required for AI-generated images',
      options: {
        list: [
          { title: 'Concept configuration shown — final components and appearance may vary', value: 'concept_config' },
          { title: 'AI-generated visualization', value: 'ai_generated' },
          { title: 'Not applicable', value: 'not_applicable' },
        ],
      },
    },
  ],
  preview: {
    select: {
      media: 'asset',
      title: 'assetType',
      status: 'status',
    },
    prepare(selection: AssetPreviewSelection) {
      return {
        media: selection.media,
        title: selection.title,
        subtitle: `Status: ${selection.status}`,
      }
    },
  },
}

export default asset
