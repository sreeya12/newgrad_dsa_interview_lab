import { useRoute } from './router.jsx'
import NavBar from './components/NavBar.jsx'
import Home from './pages/Home.jsx'
import Leetcode45 from './pages/Leetcode45.jsx'
import SystemDesign from './pages/SystemDesign.jsx'
import CppCheatSheet from './pages/CppCheatSheet.jsx'
import DsaExplained from './pages/DsaExplained.jsx'
import DsaReference from './pages/DsaReference.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'
import './pages/pages.css'

const views = {
  '/': Home,
  '/leetcode-45': Leetcode45,
  '/system-design': SystemDesign,
  '/cpp-cheatsheet': CppCheatSheet,
  '/dsa-explained': DsaExplained,
  '/dsa-reference': DsaReference,
}

function App() {
  const path = useRoute()
  const View = views[path] ?? NotFound

  return (
    <>
      <NavBar />
      <div className="app-main">
        <View />
      </div>
    </>
  )
}

export default App
