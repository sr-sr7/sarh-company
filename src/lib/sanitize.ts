// Strip HTML tags and dangerous characters from user input
export function sanitizeText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<[^>]*>/g, '')           // strip HTML tags
    .replace(/javascript:/gi, '')      // strip js: protocol
    .replace(/on\w+\s*=/gi, '')        // strip event handlers
    .trim()
    .slice(0, 5000)                    // max length
}

export function sanitizeNumber(value: unknown, fallback = 0): number {
  const n = Number(value)
  return isFinite(n) && n >= 0 ? n : fallback
}

// Partial sanitize — only includes keys that exist in the body (for PATCH)
export function sanitizePropertyPartial(body: Record<string, unknown>): Record<string, unknown> {
  const full = sanitizeProperty(body)
  const result: Record<string, unknown> = {}
  for (const key of Object.keys(body)) {
    if (key in full) result[key] = (full as any)[key]
  }
  return result
}

export function sanitizeProperty(body: Record<string, unknown>) {
  return {
    title:       sanitizeText(body.title),
    description: sanitizeText(body.description),
    type:        sanitizeText(body.type),
    operation:   sanitizeText(body.operation),
    status:      sanitizeText(body.status),
    city:        sanitizeText(body.city),
    district:    body.district ? sanitizeText(body.district) : null,
    price:       sanitizeNumber(body.price),
    price_unit:  sanitizeText(body.price_unit),
    area:        body.area != null ? sanitizeNumber(body.area) : null,
    bedrooms:    sanitizeNumber(body.bedrooms),
    bathrooms:   sanitizeNumber(body.bathrooms),
    has_pool:    Boolean(body.has_pool),
    has_parking: Boolean(body.has_parking),
    has_garden:  Boolean(body.has_garden),
    has_annex:   Boolean(body.has_annex),
    images:      Array.isArray(body.images) ? (body.images as unknown[]).filter(u => typeof u === 'string').map(u => sanitizeText(u as string)) : [],
    main_image:  body.main_image ? sanitizeText(body.main_image) : null,
    is_featured: Boolean(body.is_featured),
    is_new:      Boolean(body.is_new),
    whatsapp:    sanitizeText(body.whatsapp).replace(/\D/g, ''),
    video_url:   body.video_url ? sanitizeText(body.video_url) : null,
    map_url:     body.map_url ? sanitizeText(body.map_url) : null,
    listing_number: body.listing_number != null ? sanitizeNumber(body.listing_number) : undefined,
    maid_rooms:  body.maid_rooms != null ? sanitizeNumber(body.maid_rooms) : null,
    kitchens:    body.kitchens != null ? sanitizeNumber(body.kitchens) : null,
    bid_price:   body.bid_price != null && body.bid_price !== '' ? sanitizeNumber(body.bid_price) : null,
  }
}
