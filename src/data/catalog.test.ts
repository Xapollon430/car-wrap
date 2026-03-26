import { cars } from './cars'
import { wraps } from './wraps'

test('cars manifest has 10 items', () => {
  expect(cars).toHaveLength(10)
})

test('wraps manifest has 10 items', () => {
  expect(wraps).toHaveLength(10)
})

test('every item has id label and imagePath', () => {
  for (const item of [...cars, ...wraps]) {
    expect(item.id).toBeTruthy()
    expect(item.label).toBeTruthy()
    expect(item.imagePath.startsWith('/')).toBe(true)
  }
})
