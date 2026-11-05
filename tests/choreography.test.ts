import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { entryFlight, exitFlight, type CardLayout } from '../src/scene/choreography.ts'

const cards: CardLayout[] = [
  { x: 75, y: 137, width: 137, height: 137, rotation: 24, opacity: 1 },
  { x: 35, y: 35, width: 319, height: 64, rotation: 4, opacity: 0.3 },
  { x: 25, y: 268, width: 319, height: 64, rotation: 7, opacity: 0.92 },
  { x: 208, y: 281, width: 165, height: 110, rotation: -2, opacity: 1 },
]
const last = (values: unknown) => (values as number[]).at(-1)!
const first = (values: unknown) => (values as number[])[0]!

test('exits converge below the curved horizon, including the widest rotated cards', () => {
  for (const horizon of [284, 375]) for (const [i, card] of cards.entries()) {
    const { keyframes } = exitFlight(card, horizon, i, cards.length)
    const centerX = card.x + card.width / 2 + last(keyframes.x)
    const centerY = card.y + card.height / 2 + last(keyframes.y)
    const radius = Math.hypot(card.width, card.height) / 2 * last(keyframes.scale)
    assert.equal(centerX, 201)
    assert.ok(centerY - radius > horizon + 31, 'the mask must cover the entire departing card')
    assert.ok(last(keyframes.y) > 0, 'departure must fall down, not slide sideways or up')
  }
})

test('entrances launch from behind the mask and settle without accumulating transforms', () => {
  for (const card of cards) {
    const { keyframes } = entryFlight(card, 375, 0)
    const radius = Math.hypot(card.width, card.height) / 2 * first(keyframes.scale)
    assert.ok(card.y + card.height / 2 + first(keyframes.y) - radius > 406)
    assert.ok((keyframes.y as number[]).some(y => y < 0), 'the launch must pass its resting position')
    assert.equal(last(keyframes.x), 0)
    assert.equal(last(keyframes.y), 0)
    assert.equal(last(keyframes.scale), 1)
    assert.equal(last(keyframes.rotate), card.rotation)
    assert.equal(last(keyframes.opacity), card.opacity)
  }
})

test('lower cards depart first; incoming cards assemble from the top down', () => {
  assert.ok(exitFlight(cards[0]!, 375, 0, 4).options.delay! > exitFlight(cards[3]!, 375, 3, 4).options.delay!)
  assert.ok(entryFlight(cards[0]!, 375, 0).options.delay! < entryFlight(cards[3]!, 375, 3).options.delay!)
})
