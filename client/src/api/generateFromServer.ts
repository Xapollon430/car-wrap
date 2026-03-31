export type GenerateInput = {
  carName: string
  wrapName: string
}

export type GenerateResult = {
  imageUrl: string
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
    throw new Error(await readErrorMessage(response, 'Could not generate image'))
  }

  return readJson<GenerateResult>(response)
}

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  try {
    const errorBody = await readJson<ErrorResponse>(response)
    if (errorBody.error) {
      return errorBody.error
    }
  } catch {
    // Ignore parse failures and use fallback.
  }

  return fallback
}

async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T
}
