import { defineField, defineType } from 'sanity'

export const promoCode = defineType({
  name: 'promoCode',
  title: 'Promo Code',
  type: 'document',
  fields: [
    defineField({
      name: 'code',
      title: 'Code',
      type: 'string',
      description: 'e.g., TET2026, LOVE',
      validation: (Rule) => Rule.required().uppercase(),
    }),
    defineField({
      name: 'discountPercentage',
      title: 'Discount Percentage (%)',
      type: 'number',
      validation: (Rule) => Rule.required().min(1).max(100),
    }),
    defineField({
      name: 'validUntil',
      title: 'Valid Until',
      type: 'datetime',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active',
      type: 'boolean',
      initialValue: true,
    }),
  ],
})
