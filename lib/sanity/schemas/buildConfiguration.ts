type ValidationRule = {
  required(): ValidationRule
}

type BuildConfigurationPreviewSelection = {
  title?: string
  product?: string
  useCases?: string[]
}

const buildConfiguration = {
  name: 'buildConfiguration',
  title: 'PC Build Configurations',
  type: 'document',
  fields: [
    {
      name: 'product',
      title: 'Parent Product',
      type: 'reference',
      to: [{ type: 'product' }],
      validation: (Rule: ValidationRule) => Rule.required(),
    },
    {
      name: 'name',
      title: 'Configuration Name',
      type: 'string',
      validation: (Rule: ValidationRule) => Rule.required(),
      description: 'e.g. "Gaming Build", "Workstation Build"',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'useCases',
      title: 'Use Cases',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Gaming', value: 'gaming' },
          { title: 'CAD/3D Design', value: 'cad' },
          { title: 'AI/Machine Learning', value: 'ai' },
          { title: 'Workstation', value: 'workstation' },
          { title: 'Streaming', value: 'streaming' },
          { title: 'Content Creation', value: 'content_creation' },
          { title: 'Development', value: 'development' },
        ],
      },
    },
    {
      name: 'cpuPreference',
      title: 'CPU Preference',
      type: 'string',
      options: {
        list: [
          { title: 'Intel', value: 'intel' },
          { title: 'AMD', value: 'amd' },
          { title: 'No Preference', value: 'any' },
        ],
      },
    },
    {
      name: 'gpuPreference',
      title: 'GPU Preference',
      type: 'string',
      description: 'e.g. NVIDIA, AMD, Intel Arc',
    },
    {
      name: 'budgetRange',
      title: 'Budget Range',
      type: 'object',
      fields: [
        {
          name: 'minimum',
          title: 'Minimum Budget',
          type: 'number',
        },
        {
          name: 'maximum',
          title: 'Maximum Budget',
          type: 'number',
        },
      ],
    },
    {
      name: 'storageOptions',
      title: 'Storage Options',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "500GB SSD", "2TB NVMe"',
    },
    {
      name: 'ramOptions',
      title: 'RAM Options',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'e.g. "32GB DDR5", "64GB DDR4"',
    },
    {
      name: 'monitorIncluded',
      title: 'Include Monitor in Quote',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'aestheticPreference',
      title: 'Aesthetic Preference',
      type: 'string',
      description: 'e.g. RGB gaming aesthetic, minimalist professional, etc.',
    },
    {
      name: 'allowExistingComponents',
      title: 'Allow Existing Components',
      type: 'boolean',
      initialValue: false,
      description: 'Can customer provide their own parts?',
    },
    {
      name: 'representativeImage',
      title: 'Representative Build Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    },
    {
      name: 'specExample',
      title: 'Example Specifications',
      type: 'text',
      rows: 4,
      description: 'Example parts list for this configuration',
    },
    {
      name: 'published',
      title: 'Published',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {
      title: 'name',
      product: 'product.name',
      useCases: 'useCases',
    },
    prepare(selection: BuildConfigurationPreviewSelection) {
      return {
        title: `${selection.product} - ${selection.title}`,
        subtitle: selection.useCases?.join(', ') || 'No use cases',
      }
    },
  },
}

export default buildConfiguration
