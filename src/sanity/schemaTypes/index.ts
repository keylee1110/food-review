import { type SchemaTypeDefinition } from 'sanity'
import { review } from './review'
import { mapList } from './mapList'
import { promoCode } from './promoCode'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [review, mapList, promoCode],
}
