import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import KanbanBoard from "./components/kanban-board"
import Login from "./pages/login"
import SignUp from "./pages/signup"
import "./globals.css"

function App() {
  // TODO: Replace this with actual auth check
  const isAuthenticated = false;

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            isAuthenticated ? <KanbanBoard /> : <Navigate to="/login" replace />
          } 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
