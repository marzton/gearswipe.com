type ValidationRule = {
  required(): ValidationRule
  unique(): ValidationRule
}

type QuotePreviewSelection = {
  quoteNum?: string
  customer?: string
  status?: string
}

const quote = {
  name: 'quote',
  title: 'Build Quotes & Orders',
  type: 'document',
  fields: [
    {
      name: 'buildConfig',
      title: 'Build Configuration',
      type: 'reference',
      to: [{ type: 'buildConfiguration' }],
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'quoteNumber',
      title: 'Quote Number',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.unique(),
      description: 'Auto-generated or manual reference',
    },
    {
      name: 'customer',
      title: 'Customer Information',
      type: 'object',
      fields: [
        {
          name: 'name',
          title: 'Full Name',
          type: 'string',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'email',
          title: 'Email',
          type: 'email',
          validation: (Rule: ValidationRule) => Rule.required(),
        },
        {
          name: 'phone',
          title: 'Phone',
          type: 'string',
        },
      ],
    },
    {
      name: 'requirements',
      title: 'Customer Requirements',
      type: 'object',
      fields: [
        {
          name: 'budget',
          title: 'Budget',
          type: 'number',
        },
        {
          name: 'cpuPreference',
          title: 'CPU Preference',
          type: 'string',
        },
        {
          name: 'gpuPreference',
          title: 'GPU Preference',
          type: 'string',
        },
        {
          name: 'workload',
          title: 'Primary Workload',
          type: 'string',
          description: 'Gaming, CAD, streaming, etc.',
        },
        {
          name: 'aestheticPreference',
          title: 'Aesthetic Preference',
          type: 'string',
        },
        {
          name: 'storageNeeds',
          title: 'Storage Needs',
          type: 'string',
        },
        {
          name: 'ramNeeds',
          title: 'RAM Needs',
          type: 'string',
        },
        {
          name: 'monitorRequired',
          title: 'Include Monitor',
          type: 'boolean',
        },
        {
          name: 'existingComponents',
          title: 'Existing Components to Reuse',
          type: 'text',
          rows: 3,
        },
        {
          name: 'additionalNotes',
          title: 'Additional Notes',
          type: 'text',
          rows: 4,
        },
      ],
    },
    {
      name: 'status',
      title: 'Quote Status',
      type: 'string',
      options: {
        list: [
          { title: 'Submitted', value: 'submitted' },
          { title: 'Under Review', value: 'under_review' },
          { title: 'Parts Sourced', value: 'parts_sourced' },
          { title: 'Compatibility Checked', value: 'compatibility_checked' },
          { title: 'Quote Ready', value: 'quote_ready' },
          { title: 'Awaiting Approval', value: 'awaiting_approval' },
          { title: 'Approved', value: 'approved' },
          { title: 'Payment Pending', value: 'payment_pending' },
          { title: 'Procurement', value: 'procurement' },
          { title: 'Assembly', value: 'assembly' },
          { title: 'QA/Testing', value: 'qa' },
          { title: 'Shipment', value: 'shipment' },
          { title: 'Completed', value: 'completed' },
        ],
      },
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'billOfMaterials',
      title: 'Bill of Materials',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'partName',
              title: 'Part Name',
              type: 'string',
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
            },
            {
              name: 'unitCost',
              title: 'Unit Cost',
              type: 'number',
            },
            {
              name: 'notes',
              title: 'Notes',
              type: 'string',
            },
          ],
        },
      ],
    },
    {
      name: 'pricing',
      title: 'Pricing',
      type: 'object',
      fields: [
        {
          name: 'estimatedCost',
          title: 'Estimated Cost',
          type: 'number',
        },
        {
          name: 'quotedPrice',
          title: 'Quoted Price',
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
      name: 'workflow',
      title: 'Workflow',
      type: 'object',
      fields: [
        {
          name: 'assignedTo',
          title: 'Assigned To',
          type: 'string',
          description: 'Admin name who is handling this quote',
        },
        {
          name: 'approvedBy',
          title: 'Approved By',
          type: 'string',
        },
        {
          name: 'approvalNotes',
          title: 'Approval Notes',
          type: 'text',
          rows: 3,
        },
      ],
    },
    {
      name: 'milestones',
      title: 'Key Milestones',
      type: 'object',
      fields: [
        {
          name: 'submittedAt',
          title: 'Submitted Date',
          type: 'datetime',
        },
        {
          name: 'assemblyStartedAt',
          title: 'Assembly Started',
          type: 'datetime',
        },
        {
          name: 'qaCompletedAt',
          title: 'QA Completed',
          type: 'datetime',
        },
        {
          name: 'shippedAt',
          title: 'Shipped Date',
          type: 'datetime',
        },
        {
          name: 'completedAt',
          title: 'Completed Date',
          type: 'datetime',
        },
      ],
    },
    {
      name: 'delivery',
      title: 'Delivery Information',
      type: 'object',
      fields: [
        {
          name: 'trackingNumber',
          title: 'Tracking Number',
          type: 'string',
        },
        {
          name: 'completionImage',
          title: 'Delivery/Completion Photo',
          type: 'image',
          options: {
            hotspot: true,
          },
        },
        {
          name: 'completionNotes',
          title: 'Completion Notes',
          type: 'text',
          rows: 3,
        },
      ],
    },
    {
      name: 'internalNotes',
      title: 'Internal Notes',
      type: 'text',
      rows: 4,
    },
  ],
  preview: {
    select: {
      quoteNum: 'quoteNumber',
      customer: 'customer.name',
      status: 'status',
    },
    prepare(selection: QuotePreviewSelection) {
      return {
        title: `Quote ${selection.quoteNum} - ${selection.customer}`,
        subtitle: `Status: ${selection.status}`,
      }
    },
  },
}

export default quote
