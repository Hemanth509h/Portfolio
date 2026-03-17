import { Routes, Route } from "react-router-dom";
import Home from "./components/page/Home";
import NotFound from "./components/page/NotFound";

function Router() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return <Router />;
}

export default App;