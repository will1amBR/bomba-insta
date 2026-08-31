import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import { HomeRoute } from '@/components/HomeRoute'
import { ProtectedRoute } from '@/components/ProtectedRoute'

import Analysis from './pages/Analysis'
import ScriptGenerator from './pages/ScriptGenerator'
import ScriptsLibrary from './pages/ScriptsLibrary'
import AiStrategist from './pages/AiStrategist'
import SocialSnapshot from './pages/SocialSnapshot'
import Competitors from './pages/Competitors'
import CompetitorDetail from './pages/CompetitorDetail'
import ActionPlanPage from './pages/ActionPlanPage'
import ClientPortal from './pages/ClientPortal'
import AgencyDashboard from './pages/AgencyDashboard'
import AgencyClientDetail from './pages/AgencyClientDetail'
import NicheReport from './pages/NicheReport'
import PlansPage from './pages/Plans'
import Login from './pages/Login'
import Signup from './pages/Signup'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomeRoute />} />
          <Route path="/plans" element={<PlansPage />} />
          <Route path="/planos" element={<Navigate to="/plans" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth" element={<Navigate to="/login" replace />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/analise" element={<Analysis />} />
            <Route path="/roteiros" element={<ScriptGenerator />} />
            <Route path="/biblioteca" element={<ScriptsLibrary />} />
            <Route path="/chat" element={<AiStrategist />} />
            <Route path="/snapshot" element={<SocialSnapshot />} />
            <Route path="/concorrentes" element={<Competitors />} />
            <Route path="/concorrentes/:id" element={<CompetitorDetail />} />
            <Route path="/nicho" element={<NicheReport />} />
            <Route path="/plano" element={<ActionPlanPage />} />
            <Route path="/portal" element={<ClientPortal />} />
            <Route path="/agencia" element={<AgencyDashboard />} />
            <Route path="/agencia/clientes/:id" element={<AgencyClientDetail />} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
