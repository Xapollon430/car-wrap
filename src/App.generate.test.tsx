import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, vi } from 'vitest'
import * as generateApi from './api/generateMock'
import App from './App'
import { cars } from './data/cars'
import { wraps } from './data/wraps'

afterEach(() => {
  vi.restoreAllMocks()
})

async function generatePreview(): Promise<void> {
  const user = userEvent.setup()
  render(<App />)

  await user.click(
    screen.getByRole('button', { name: new RegExp(cars[0].label, 'i') }),
  )
  await user.click(
    screen.getByRole('button', { name: new RegExp(wraps[0].label, 'i') }),
  )
  await user.click(screen.getByRole('button', { name: /generate/i }))

  await screen.findByAltText(/generated result/i)
}

test('shows generated image after clicking generate', async () => {
  vi.spyOn(generateApi, 'generateMock').mockResolvedValue({
    imageUrl: '/generated/mock-result.jpg',
    prompt: `Generate ${cars[0].label} with ${wraps[0].label} wrap`,
  })

  const user = userEvent.setup()
  render(<App />)

  await user.click(
    screen.getByRole('button', { name: new RegExp(cars[0].label, 'i') }),
  )
  await user.click(
    screen.getByRole('button', { name: new RegExp(wraps[0].label, 'i') }),
  )
  await user.click(screen.getByRole('button', { name: /generate/i }))

  expect(await screen.findByAltText(/generated result/i)).toBeInTheDocument()
})

test('shows an error message when generation fails', async () => {
  vi.spyOn(generateApi, 'generateMock').mockRejectedValue(
    new Error('Could not generate image'),
  )

  const user = userEvent.setup()
  render(<App />)

  await user.click(
    screen.getByRole('button', { name: new RegExp(cars[0].label, 'i') }),
  )
  await user.click(
    screen.getByRole('button', { name: new RegExp(wraps[0].label, 'i') }),
  )
  await user.click(screen.getByRole('button', { name: /generate/i }))

  expect(
    await screen.findByText(/could(n't| not) generate image/i),
  ).toBeInTheDocument()
})

test('opens a large preview modal when maximize is clicked', async () => {
  vi.spyOn(generateApi, 'generateMock').mockResolvedValue({
    imageUrl: '/generated/mock-result.jpg',
    prompt: `Generate ${cars[0].label} with ${wraps[0].label} wrap`,
  })

  const user = userEvent.setup()
  await generatePreview()

  await user.click(screen.getByRole('button', { name: /maximize/i }))

  expect(
    await screen.findByRole('dialog', { name: /generated preview/i }),
  ).toBeInTheDocument()
})

test('closes modal with close button, backdrop, and escape key', async () => {
  vi.spyOn(generateApi, 'generateMock').mockResolvedValue({
    imageUrl: '/generated/mock-result.jpg',
    prompt: `Generate ${cars[0].label} with ${wraps[0].label} wrap`,
  })

  const user = userEvent.setup()

  await generatePreview()
  await user.click(screen.getByRole('button', { name: /maximize/i }))
  await user.click(screen.getByRole('button', { name: /close preview/i }))
  expect(
    screen.queryByRole('dialog', { name: /generated preview/i }),
  ).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /maximize/i }))
  await user.click(screen.getByTestId('image-modal-backdrop'))
  expect(
    screen.queryByRole('dialog', { name: /generated preview/i }),
  ).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: /maximize/i }))
  await user.keyboard('{Escape}')
  expect(
    screen.queryByRole('dialog', { name: /generated preview/i }),
  ).not.toBeInTheDocument()
})
