import { generateMock } from './generateMock'

test('returns generated image URL on success', async () => {
  const result = await generateMock({
    carLabel: 'Toyota Camry',
    wrapLabel: 'Gloss Black',
  })

  expect(result.imageUrl).toMatch(/^\/generated\//)
  expect(result.prompt).toContain('Toyota Camry')
  expect(result.prompt).toContain('Gloss Black')
})

test('throws when forceError is true', async () => {
  await expect(
    generateMock({
      carLabel: 'Toyota Camry',
      wrapLabel: 'Gloss Black',
      forceError: true,
    }),
  ).rejects.toThrow(/could not generate image/i)
})
