import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./layouts/Layout";
import { HomePage } from "./pages/HomePage";
import { BasketPage } from "./pages/BasketPage";
import { PortfolioPage } from "./pages/PortfolioPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/basket/:id" element={<BasketPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
