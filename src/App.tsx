import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BottomNav } from './components/BottomNav'
import { SyncRoot } from './components/SyncRoot'
import { Home } from './routes/Home'
import { Consolidated } from './routes/Consolidated'
import { Config } from './routes/Config'

export default function App() {
  return (
    <BrowserRouter>
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/consolidated" element={<Consolidated />} />
          <Route path="/config" element={<Config />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <BottomNav />
      <SyncRoot />
    </BrowserRouter>
  )
}
