import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'

import Dashboard from './pages/Dashboard'
import Analysis from './pages/Analysis'
import ScriptGenerator from './pages/ScriptGenerator'
import ScriptsLibrary from './pages/ScriptsLibrary'
import AiStrategist from './pages/AiStrategist'
import Auth from './pages/Auth'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analise" element={<Analysis />} />
          <Route path="/roteiros" element={<ScriptGenerator />} />
          <Route path="/biblioteca" element={<ScriptsLibrary />} />
          <Route path="/chat" element={<AiStrategist />} />
          <Route path="/auth" element={<Auth />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
