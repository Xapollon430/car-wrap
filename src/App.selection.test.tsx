import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { cars } from './data/cars'
import { wraps } from './data/wraps'

test('generate is disabled until car and wrap are selected', async () => {
  const user = userEvent.setup()
  render(<App />)

  const generateButton = screen.getByRole('button', { name: /generate/i })
  expect(generateButton).toBeDisabled()

  await user.click(
    screen.getByRole('button', { name: new RegExp(cars[0].label, 'i') }),
  )
  expect(generateButton).toBeDisabled()

  await user.click(
    screen.getByRole('button', { name: new RegExp(wraps[0].label, 'i') }),
  )
  expect(generateButton).toBeEnabled()
})

test('selection controls and result panel expose accessible region labels', () => {
  render(<App />)

  expect(
    screen.getByRole('region', { name: /car options/i }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('region', { name: /wrap options/i }),
  ).toBeInTheDocument()
  expect(
    screen.getByRole('region', { name: /result preview/i }),
  ).toBeInTheDocument()
})

test('filters cars with the car search input', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText(/search cars/i), 'mustang')

  expect(
    screen.getByRole('button', { name: /ford mustang gt/i }),
  ).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: /toyota camry/i })).not.toBeInTheDocument()
})

test('shows empty message when wraps search has no matches', async () => {
  const user = userEvent.setup()
  render(<App />)

  await user.type(screen.getByLabelText(/search wraps/i), 'zzzzz')

  expect(screen.getByText(/no wraps match/i)).toBeInTheDocument()
})
