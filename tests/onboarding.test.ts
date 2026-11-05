import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { adjacentSlide, composition, slides, type SlideIndex } from '../src/onboarding.ts'

test('forward and backward navigation wrap without creating an empty page', () => {
  let page: SlideIndex = 0
  for (let i = 0; i < 30; i++) {
    const next = adjacentSlide(page, 1)
    assert.ok(slides[next])
    assert.equal(adjacentSlide(next, -1), page)
    page = next
  }
  assert.equal(page, 0)
  assert.equal(adjacentSlide(0, -1), 2)
})

test('all pages keep text, pagination, and the footer apart on supported phone sizes', () => {
  for (const [width, height] of [[320, 480], [375, 571], [390, 749], [402, 778], [430, 830]]) {
    for (const page of [0, 1, 2] as const) {
      const layout = composition(width!, height!, page)
      const heading = layout.titleSize * 1.3 * (page === 0 ? 2 : 1)
      const contentBottom = layout.copyTop + heading + layout.titleSize * 1.25 - 2 + layout.descriptionGap + layout.bodySize * 3.5 + layout.paginationGap + 44
      assert.ok(contentBottom < height! - 80, `page ${page} overlaps the footer at ${width} × ${height}`)
      assert.ok(layout.copyWidth <= width! - 32)
      assert.ok(layout.copyTop > layout.horizon + 31 * layout.scale)
    }
  }
})

test('the two detailed scenes share a horizon for the same launch point', () => {
  assert.equal(composition(402, 778, 1).horizon, composition(402, 778, 2).horizon)
  assert.ok(composition(402, 778, 0).horizon < composition(402, 778, 1).horizon)
})
