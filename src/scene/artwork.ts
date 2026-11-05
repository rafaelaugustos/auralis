import { AbsoluteLayout, Color, GridLayout, Label, type View } from '@nativescript/core'
import { GlassView } from '@rafaelaugusto/jolt/glass'
import { shape, type Shape } from '@rafaelaugusto/jolt/shapes'
import type { MotionScope } from '@rafaelaugusto/jolt'
import type { CardLayout } from './choreography'

export function place<T extends View>(parent: AbsoluteLayout, view: T, x: number, y: number, width: number, height: number): T {
  view.width = width
  view.height = height
  AbsoluteLayout.setLeft(view, x)
  AbsoluteLayout.setTop(view, y)
  parent.addChild(view)
  return view
}

export function surface(parent: AbsoluteLayout, x: number, y: number, width: number, height: number, radius = 0) {
  const view = place(parent, new GridLayout(), x, y, width, height)
  view.borderRadius = radius
  return view
}

function text(parent: AbsoluteLayout, value: string, x: number, y: number, width: number, size: number, color = '#ffffff', weight: 'normal' | '600' = 'normal') {
  const label = place(parent, new Label(), x, y, width, size * 1.8)
  label.text = value
  label.fontSize = size
  label.color = new Color(color)
  label.fontWeight = weight
  return label
}

export const icons = {
  spark: 'M24 0 C26 16 32 21 48 24 C32 27 26 32 24 48 C21 32 16 27 0 24 C16 21 21 16 24 0 Z',
  chat: 'M8 7 Q3 7 3 13 L3 30 Q3 36 10 36 L10 44 L21 36 L35 36 Q42 36 42 29 L42 13 Q42 7 35 7 Z M14 21 L15 21 M23 21 L24 21 M32 21 L33 21',
  project: 'M7 5 L36 5 L36 43 L7 43 Z M15 3 L15 10 M28 3 L28 10 M28 21 C28 28 17 28 17 21 C17 14 28 14 28 21 M12 37 C13 27 32 27 33 37',
  video: 'M5 12 Q3 12 3 16 L3 34 Q3 38 7 38 L29 38 Q33 38 33 34 L33 15 Q33 12 29 12 Z M34 21 L45 13 L45 37 L34 30',
  document: 'M10 3 L28 3 L39 14 L39 45 L10 45 Z M28 3 L28 15 L39 15 M17 25 L31 25 M17 32 L31 32',
  finance: 'M40 20 L40 7 L7 7 L7 40 L27 40 M7 9 L24 24 L38 11 M32 34 L38 40 L47 28',
  calendar: 'M6 9 L42 9 L42 43 L6 43 Z M6 19 L42 19 M15 3 L15 14 M33 3 L33 14 M14 26 L17 26 M24 26 L27 26 M33 26 L36 26 M14 35 L17 35 M24 35 L27 35',
  drop: 'M26 3 C22 11 8 21 8 31 C8 50 40 50 40 31 C40 21 30 11 26 3 Z',
  mail: 'M4 10 L44 10 L44 39 L4 39 Z M4 11 L24 27 L44 11',
  funnel: 'M3 7 L45 7 L29 26 L29 41 L20 37 L20 26 Z',
} as const

export type Icon = keyof typeof icons

export function drawIcon(parent: AbsoluteLayout, kind: Icon, x: number, y: number, size: number, drawings: Shape[], filled = false) {
  const paint = surface(parent, x, y, size, size)
  drawings.push(shape(paint, {
    d: icons[kind], viewBox: [0, 0, 48, 48],
    fill: filled ? '#f8faff' : undefined,
    stroke: filled ? 'transparent' : '#f5f4ff', strokeWidth: filled ? 0 : 2.5, lineJoin: 'round', lineCap: 'round',
  }))
  return paint
}

export interface Card extends CardLayout {
  view: AbsoluteLayout
  art: AbsoluteLayout
}

function card(parent: AbsoluteLayout, x: number, y: number, width: number, height: number, rotation: number, opacity = 1): Card {
  const view = place(parent, new AbsoluteLayout(), x, y, width, height)
  view.rotate = rotation
  view.opacity = opacity
  const art = place(view, new AbsoluteLayout(), 0, 0, width, height)
  return { view, art, rotation, opacity, x, y, width, height }
}

export function createEmblems(parent: AbsoluteLayout, scope: MotionScope, drawings: Shape[]): Card[] {
  const specs = [
    { x: 75, y: 137, size: 137, rotation: 24, color: '#7d3cdb', glow: '#bc81ff' },
    { x: 198, y: 89, size: 140, rotation: -17, color: '#326b76', glow: '#bdffec' },
  ]
  return specs.map((spec, index) => {
    const result = card(parent, spec.x, spec.y, spec.size, spec.size, spec.rotation)
    const glass = place(result.art, new GlassView(), 0, 0, spec.size, spec.size)
    glass.glassRadius = 29
    glass.glassStyle = 'clear'
    glass.glassTint = spec.color + '66'
    glass.glassFallback = 'blur'
    glass.borderRadius = 29
    const tint = surface(result.art, 0, 0, spec.size, spec.size, 29)
    scope.gradient(tint, { type: 'linear', angle: 145,
      colors: index === 0 ? ['#8557bf88', '#4d54ca44', '#b183fa77'] : ['#74979c66', '#36566a33', '#a0f0cc66'],
    })
    tint.borderWidth = 0.7
    tint.borderColor = new Color(index === 0 ? '#d9baff88' : '#d6fff477')
    // The small inset rim catches the light without scaling the drawing surface.
    const rim = surface(result.art, 3, 3, spec.size - 6, spec.size - 6, 26)
    rim.borderWidth = 0.5
    rim.borderColor = new Color('#ffffff33')
    const light = surface(result.art, 0, 0, spec.size, spec.size, 29)
    scope.gradient(light, { type: 'radial', colors: [spec.glow + 'b0', spec.glow + '00'], center: { x: 0.5, y: 1.12 }, radius: 0.82 })
    const highlight = surface(result.art, 0, 0, spec.size, spec.size)
    drawings.push(shape(highlight, {
      d: `M8 ${spec.size - 33} Q8 ${spec.size - 8} 34 ${spec.size - 8} L${spec.size - 34} ${spec.size - 8} Q${spec.size - 8} ${spec.size - 8} ${spec.size - 8} ${spec.size - 33}`,
      viewBox: [0, 0, spec.size, spec.size], stroke: '#f2eaff44', strokeWidth: 0.8, lineCap: 'round',
    }))
    if (index === 0) {
      const dots = [[0, -28], [20, -22], [-20, -18], [-31, 0], [-13, 0], [7, -4], [28, 1], [-21, 21], [-2, 16], [18, 24], [0, 37], [36, 22], [-36, 21], [37, -20]]
      dots.forEach(([dx, dy], i) => {
        const dot = surface(result.art, 64 + dx!, 59 + dy!, i % 4 === 0 ? 8 : 7, i % 4 === 0 ? 8 : 7, 4)
        dot.backgroundColor = new Color(i % 3 === 0 ? '#e8d1ff' : '#ffffff')
        dot.opacity = i % 3 === 0 ? 0.55 : 0.95
      })
    } else {
      drawIcon(result.art, 'spark', 40, 58, 47, drawings, true)
      drawIcon(result.art, 'spark', 73, 31, 32, drawings, true)
    }
    return result
  })
}

export function createTeammates(parent: AbsoluteLayout, scope: MotionScope, drawings: Shape[]): Card[] {
  const people: { title: string; subtitle: string; icon: Icon; x: number; y: number; rotation: number; opacity: number }[] = [
    { title: 'AI Chat Assistant', subtitle: 'Chats, writes, plans', icon: 'chat', x: 35, y: 35, rotation: 4, opacity: 0.3 },
    { title: 'AI Project Manager', subtitle: 'Plans sprints & tracks delivery', icon: 'project', x: 56, y: 95, rotation: -4, opacity: 0.98 },
    { title: 'AI Meeting Assistant', subtitle: 'Captures notes & next steps', icon: 'video', x: 20, y: 152, rotation: 3, opacity: 1 },
    { title: 'AI Content Assistant', subtitle: 'Drafts proposals & reports', icon: 'document', x: 58, y: 211, rotation: -2, opacity: 0.98 },
    { title: 'AI Finance Manager', subtitle: 'Invoices, expenses, forecasts', icon: 'finance', x: 25, y: 268, rotation: 7, opacity: 0.92 },
  ]
  return people.map((person, i) => {
    const result = card(parent, person.x, person.y, 319, 64, person.rotation, person.opacity)
    const plate = surface(result.art, 0, 0, 319, 64, 12)
    scope.gradient(plate, { type: 'linear', angle: 110, colors: ['#747dc638', '#8584d148', i > 1 ? '#d27aff55' : '#ab86d344'] })
    plate.borderWidth = 0.7
    plate.borderColor = new Color('#c7c5ff35')
    const iconPlate = surface(result.art, 8, 9, 45, 45, 12)
    scope.gradient(iconPlate, { type: 'linear', angle: 135, colors: ['#d0c1ff22', '#a99afa40'] })
    iconPlate.borderWidth = 0.5
    iconPlate.borderColor = new Color('#d8cdff28')
    drawIcon(result.art, person.icon, 18, 20, 23, drawings)
    text(result.art, person.title, 67, 9, 190, 12.5, '#f1efff', '600')
    text(result.art, person.subtitle, 67, 35, 217, 9.4, '#b1abd2')
    const status = surface(result.art, 257, 12, 51, 19, 10)
    status.backgroundColor = new Color('#dfc9ff28')
    const active = new Label()
    active.text = 'Active'
    active.fontSize = 9
    active.color = new Color('#e9e1ff')
    active.textAlignment = 'center'
    active.verticalAlignment = 'middle'
    status.addChild(active)
    return result
  })
}

export function createTools(parent: AbsoluteLayout, scope: MotionScope, drawings: Shape[]): Card[] {
  const tools: { name: string; icon: Icon; color: string; x: number; y: number; rotation: number; status: string }[] = [
    { name: 'Daybook', icon: 'calendar', color: '#4878e5', x: 26, y: 52, rotation: -13, status: 'Connected' },
    { name: 'Huddle', icon: 'video', color: '#6346ce', x: 211, y: 56, rotation: 3, status: 'Connect' },
    { name: 'Parley', icon: 'chat', color: '#ed916b', x: 28, y: 160, rotation: 13, status: 'Connect' },
    { name: 'Inkwell', icon: 'drop', color: '#101425', x: 207, y: 165, rotation: 21, status: 'Connect' },
    { name: 'Postbox', icon: 'mail', color: '#747de6', x: 25, y: 281, rotation: -12, status: 'Connected' },
    { name: 'Leadflow', icon: 'funnel', color: '#fc805e', x: 208, y: 281, rotation: -2, status: 'Connect' },
  ]
  return tools.map(tool => {
    const result = card(parent, tool.x, tool.y, 165, 110, tool.rotation)
    const plate = surface(result.art, 0, 0, 165, 110, 15)
    scope.gradient(plate, { type: 'linear', angle: 155, colors: ['#555f9e40', '#8197c954'] })
    plate.borderWidth = 0.7
    plate.borderColor = new Color('#c2d4ff28')
    const badge = surface(result.art, 17, 17, 27, 27, 8)
    badge.backgroundColor = new Color(tool.color)
    drawIcon(result.art, tool.icon, 21, 21, 19, drawings, tool.icon === 'funnel')
    text(result.art, tool.name, 17, 58, 132, 15, '#f3f4ff', '600')
    text(result.art, tool.status, 17, 84, 132, 10.5, '#b2bfdd')
    return result
  })
}
