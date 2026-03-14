import { defineType, defineField } from 'sanity';

export const review = defineType({
  name: "review",
  title: "Food Review",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Restaurant / Dish Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "location",
      title: "Short Location (e.g., District 1, HCM)",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "googleMapsUrl",
      title: "Google Maps URL",
      type: "url",
    }),
    defineField({
      name: "rating",
      title: "Rating (out of 5)",
      type: "number",
      validation: (Rule) => Rule.required().min(1).max(5),
    }),
    defineField({
      name: "thumbnail",
      title: "Thumbnail Image",
      type: "image",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Image Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "content",
      title: "Review Content",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "tags",
      title: "Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
  ],
});
