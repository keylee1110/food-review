import { defineField, defineType } from 'sanity'

export const mapList = defineType({
  name: 'mapList',
  title: 'Map List (Hidden Gems)',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      title: 'Thumbnail',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'price',
      title: 'Price (VND)',
      type: 'number',
      validation: (Rule) => Rule.required().min(0),
    }),
    defineField({
      name: 'description',
      title: 'Short Description',
      type: 'text',
      description: 'Public description to hook users on the landing page.',
    }),
    defineField({
      name: 'demoLocations',
      title: 'Demo Locations',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of 2-3 locations to show as teasers.',
    }),
    defineField({
      name: 'mapUrl',
      title: 'Google Maps List URL',
      type: 'url',
      description: 'The secret Google Maps link, revealed after purchase.',
    }),
    defineField({
      name: 'premiumContent',
      title: 'Premium Content (Detailed Reviews)',
      type: 'array',
      of: [
        { type: 'block' },
        { 
          type: 'image',
          options: { hotspot: true }
        }
      ],
      description: 'Detailed reviews of places, hidden from the public.',
    }),
    defineField({
      name: 'purchaseCount',
      title: 'Purchase Count',
      type: 'number',
      initialValue: 0,
      description: 'Number of times this list has been purchased (used for FOMO display).',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
      description: 'Turn off to hide this list from the public store.',
    }),
  ],
})
