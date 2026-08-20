type ValidationRule = {
  required(): ValidationRule
}

type VendorPreviewSelection = {
  title?: string
  status?: string
}

const vendor = {
  name: 'vendor',
  title: 'Vendors & Partners',
  type: 'document',
  fields: [
    {
      name: 'companyName',
      title: 'Company Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'vendorType',
      title: 'Vendor Type',
      type: 'string',
      options: {
        list: [
          { title: 'Manufacturer', value: 'manufacturer' },
          { title: 'Distributor', value: 'distributor' },
          { title: 'Wholesaler', value: 'wholesaler' },
          { title: 'Reseller', value: 'reseller' },
          { title: 'Affiliate', value: 'affiliate' },
          { title: 'Supplier', value: 'supplier' },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'website',
      title: 'Website',
      type: 'url',
    },
    {
      name: 'territory',
      title: 'Territory',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Countries or regions',
    },
    {
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Contact Name',
          type: 'string',
        },
        {
          name: 'title',
          title: 'Title',
          type: 'string',
        },
        {
          name: 'email',
          title: 'Email',
          type: 'email',
        },
        {
          name: 'phone',
          title: 'Phone',
          type: 'string',
        },
      ],
    },
    {
      name: 'productCategories',
      title: 'Product Categories',
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'businessDetails',
      title: 'Business Details',
      type: 'object',
      fields: [
        {
          name: 'minimumOrderQty',
          title: 'Minimum Order Quantity',
          type: 'number',
        },
        {
          name: 'dealerApplicationUrl',
          title: 'Dealer Application URL',
          type: 'url',
        },
        {
          name: 'catalogAvailable',
          title: 'Catalog Available',
          type: 'boolean',
        },
        {
          name: 'apiAvailable',
          title: 'API Available',
          type: 'boolean',
        },
      ],
    },
    {
      name: 'relationshipStatus',
      title: 'Relationship Status',
      type: 'string',
      options: {
        list: [
          { title: 'Prospect', value: 'prospect' },
          { title: 'Researching', value: 'researching' },
          { title: 'Ready for Outreach', value: 'ready_for_outreach' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Replied', value: 'replied' },
          { title: 'Application Required', value: 'application_required' },
          { title: 'Negotiating', value: 'negotiating' },
          { title: 'Documents Pending', value: 'documents_pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Integration Pending', value: 'integration_pending' },
          { title: 'Active', value: 'active' },
          { title: 'Renewal Due', value: 'renewal_due' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'permissions',
      title: 'Permissions & Rights',
      type: 'object',
      fields: [
        {
          name: 'resellAuthorized',
          title: 'Authorized Reseller',
          type: 'boolean',
        },
        {
          name: 'advertiseAuthorized',
          title: 'Can Advertise Products',
          type: 'boolean',
        },
        {
          name: 'productImageRights',
          title: 'Product Image Rights',
          type: 'boolean',
        },
        {
          name: 'trademarkRights',
          title: 'Trademark/Logo Usage',
          type: 'boolean',
        },
        {
          name: 'pricingFeedRights',
          title: 'Pricing Feed Rights',
          type: 'boolean',
        },
        {
          name: 'aiDataProcessingRights',
          title: 'AI Data Processing Rights',
          type: 'boolean',
          description: 'Permission to use catalog data in AI systems',
        },
      ],
    },
    {
      name: 'agreement',
      title: 'Agreement Information',
      type: 'object',
      fields: [
        {
          name: 'effectiveDate',
          title: 'Effective Date',
          type: 'datetime',
        },
        {
          name: 'expirationDate',
          title: 'Expiration Date',
          type: 'datetime',
        },
        {
          name: 'documentUrl',
          title: 'Agreement Document',
          type: 'file',
        },
      ],
    },
    {
      name: 'notes',
      title: 'Internal Notes',
      type: 'text',
      rows: 4,
    },
  ],
  preview: {
    select: {
      title: 'companyName',
      status: 'relationshipStatus',
    },
    prepare(selection: VendorPreviewSelection) {
      return {
        title: selection.title,
        subtitle: `Status: ${selection.status}`,
      }
    },
  },
}

export default vendor
