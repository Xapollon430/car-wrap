import { useMemo, useState } from 'react'
import { generateMock } from './api/generateMock'
import ImageModal from './components/ImageModal'
import SelectorGrid from './components/SelectorGrid'
import { cars } from './data/cars'
import { wraps } from './data/wraps'
import './App.css'

function App() {
  const [selectedCarId, setSelectedCarId] = useState<string | null>(null)
  const [selectedWrapId, setSelectedWrapId] = useState<string | null>(null)
  const [carSearchQuery, setCarSearchQuery] = useState('')
  const [wrapSearchQuery, setWrapSearchQuery] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const selectedCar = useMemo(
    () => cars.find((car) => car.id === selectedCarId) ?? null,
    [selectedCarId],
  )
  const selectedWrap = useMemo(
    () => wraps.find((wrap) => wrap.id === selectedWrapId) ?? null,
    [selectedWrapId],
  )

  const canGenerate = selectedCar !== null && selectedWrap !== null
  const normalizedCarQuery = carSearchQuery.trim().toLowerCase()
  const normalizedWrapQuery = wrapSearchQuery.trim().toLowerCase()

  const filteredCars = useMemo(
    () =>
      cars.filter((car) =>
        car.label.toLowerCase().includes(normalizedCarQuery),
      ),
    [normalizedCarQuery],
  )
  const filteredWraps = useMemo(
    () =>
      wraps.filter((wrap) =>
        wrap.label.toLowerCase().includes(normalizedWrapQuery),
      ),
    [normalizedWrapQuery],
  )

  async function handleGenerate(): Promise<void> {
    if (!selectedCar || !selectedWrap) {
      return
    }

    setIsGenerating(true)
    setIsModalOpen(false)
    setErrorMessage(null)

    try {
      const result = await generateMock({
        carLabel: selectedCar.label,
        wrapLabel: selectedWrap.label,
      })
      setGeneratedImageUrl(result.imageUrl)
      setGeneratedPrompt(result.prompt)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Could not generate image'
      setErrorMessage(`${message}. Try again.`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Car Wrap Visualizer</h1>
        <p>Pick one car and one wrap color, then generate a preview.</p>
      </header>

      <div className="app-layout">
        <section className="panel" aria-label="car options">
          <h2>Cars</h2>
          <div className="search-group">
            <label htmlFor="search-cars" className="search-label">
              Search cars
            </label>
            <input
              id="search-cars"
              className="search-input"
              type="text"
              value={carSearchQuery}
              onChange={(event) => setCarSearchQuery(event.target.value)}
              placeholder="Type to filter cars"
            />
          </div>
          {filteredCars.length > 0 ? (
            <SelectorGrid
              items={filteredCars}
              selectedId={selectedCarId}
              onSelect={setSelectedCarId}
            />
          ) : (
            <p className="hint">No cars match "{carSearchQuery}".</p>
          )}
        </section>

        <section className="panel" aria-label="wrap options">
          <h2>Wraps</h2>
          <div className="search-group">
            <label htmlFor="search-wraps" className="search-label">
              Search wraps
            </label>
            <input
              id="search-wraps"
              className="search-input"
              type="text"
              value={wrapSearchQuery}
              onChange={(event) => setWrapSearchQuery(event.target.value)}
              placeholder="Type to filter wraps"
            />
          </div>
          {filteredWraps.length > 0 ? (
            <SelectorGrid
              items={filteredWraps}
              selectedId={selectedWrapId}
              onSelect={setSelectedWrapId}
            />
          ) : (
            <p className="hint">No wraps match "{wrapSearchQuery}".</p>
          )}
        </section>

        <section className="panel result-panel" aria-label="result preview">
          <h2>Preview</h2>
          <p>
            Car: <strong>{selectedCar?.label ?? 'Not selected'}</strong>
          </p>
          <p>
            Wrap: <strong>{selectedWrap?.label ?? 'Not selected'}</strong>
          </p>
          <button
            type="button"
            className="generate-button"
            disabled={!canGenerate || isGenerating}
            onClick={() => void handleGenerate()}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>

          {errorMessage ? <p className="error-message">{errorMessage}</p> : null}

          {isGenerating ? <p className="hint">Generating preview...</p> : null}

          {generatedImageUrl ? (
            <figure className="generated-result">
              <img src={generatedImageUrl} alt="Generated result" />
              <figcaption>{generatedPrompt}</figcaption>
            </figure>
          ) : (
            <p className="hint">No generated image yet.</p>
          )}

          {generatedImageUrl ? (
            <button
              type="button"
              className="maximize-button"
              onClick={() => setIsModalOpen(true)}
            >
              Maximize
            </button>
          ) : null}
        </section>
      </div>

      <ImageModal
        isOpen={isModalOpen && Boolean(generatedImageUrl)}
        imageUrl={generatedImageUrl ?? ''}
        caption={generatedPrompt}
        onClose={() => setIsModalOpen(false)}
      />
    </main>
  )
}

export default App
