export const slides = [
  {
    id: 'possibility',
    heading: 'RUN YOUR\nBUSINESS WITH',
    accent: 'AI TEAMMATES',
    description: 'Projects, clients, meetings, tasks, and growth.\nTogether in one AI-powered workspace.',
    label: 'Discover Auralis',
  },
  {
    id: 'teammates',
    heading: 'MEET YOUR',
    accent: 'AI TEAMMATES',
    description: 'A specialized AI for every part of your business.',
    label: 'Meet your teammates',
  },
  {
    id: 'workspace',
    heading: 'CONNECT YOUR',
    accent: 'WORKSPACE',
    description: 'Sync the tools your team already uses.',
    label: 'Connect your workspace',
  },
] as const

export type SlideIndex = 0 | 1 | 2

export function adjacentSlide(current: SlideIndex, direction: number): SlideIndex {
  return ((current + Math.sign(direction) + slides.length) % slides.length) as SlideIndex
}

/** Keep the composition inside the available safe area on short and tall phones. */
export function composition(width: number, height: number, slide: SlideIndex) {
  const scale = Math.min(width / 402, (height - 124) / 646, 1.3)
  const horizon = (slide === 0 ? 284 : 375) * scale
  return {
    scale,
    horizon,
    copyTop: horizon + (height < 660 ? 36 : 65) * scale,
    copyWidth: Math.min(width - 32, 386 * scale),
    titleSize: 36 * scale,
    bodySize: 12.5 * scale,
    descriptionGap: 22 * scale,
    paginationGap: 14 * scale,
  }
}
