export type GenerateInput = {
  carName: string
  wrapName: string
}

export type GenerateResult = {
  imageUrl: string
  prompt: string
}

type ErrorResponse = {
  error?: string
}

export async function generateFromServer(
  input: GenerateInput,
): Promise<GenerateResult> {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  if (!response.ok) {
    let message = 'Could not generate image'
    try {
      const errorBody = (await response.json()) as ErrorResponse
      if (errorBody.error) {
        message = errorBody.error
      }
    } catch {
      // Ignore parse failures and fall back to generic message.
    }
    throw new Error(message)
  }

  return (await response.json()) as GenerateResult
}
