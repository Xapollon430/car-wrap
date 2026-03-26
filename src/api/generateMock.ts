export type GenerateInput = {
  carLabel: string
  wrapLabel: string
  forceError?: boolean
}

export type GenerateResult = {
  imageUrl: string
  prompt: string
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export async function generateMock(input: GenerateInput): Promise<GenerateResult> {
  await sleep(800)

  if (input.forceError) {
    throw new Error('Could not generate image')
  }

  return {
    imageUrl: '/generated/mock-result.jpg',
    prompt: `Generate a ${input.carLabel} with a ${input.wrapLabel} wrap`,
  }
}
