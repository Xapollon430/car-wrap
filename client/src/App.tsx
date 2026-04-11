import { Navigate, Route, Routes } from 'react-router-dom'
import { DEFAULT_TENANT_SLUG } from './features/tenant/types'
import LandingPage from './pages/LandingPage'
import VisualizerPage from './pages/VisualizerPage'

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={`/${DEFAULT_TENANT_SLUG}`} replace />}
      />
      <Route
        path="/visualizer"
        element={<Navigate to={`/${DEFAULT_TENANT_SLUG}/visualizer`} replace />}
      />
      <Route path="/:slug" element={<LandingPage />} />
      <Route path="/:slug/visualizer" element={<VisualizerPage />} />
      <Route
        path="*"
        element={<Navigate to={`/${DEFAULT_TENANT_SLUG}`} replace />}
      />
    </Routes>
  )
}

export default App
