import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import KanbanBoard from "./components/kanban-board";
import Login from "./pages/login";
import SignUp from "./pages/signup";
import "./globals.css";
import ProtectedRoute from "./ProtectedRoute";


function App() {

  return (
    <BrowserRouter>
      <Routes>
       <Route path="/login" element={<Login />} />
       <Route path="/signup" element={<SignUp />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
