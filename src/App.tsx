import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "./contexts/WalletContext";
import { Layout } from "./layouts/Layout";
import { HomePage } from "./pages/HomePage";
import { BasketsPage } from "./pages/BasketsPage";
import { BasketsListPage } from "./pages/BasketsListPage";
import { BasketPage } from "./pages/BasketPage";
import { PortfolioPage } from "./pages/PortfolioPage";
import { CreateBasketPage } from "./pages/CreateBasketPage";
import { PPTPage } from "./pages/PPTPage";

function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><HomePage /></Layout>} />
          <Route path="/baskets" element={<Layout><BasketsPage /></Layout>} />
          <Route path="/baskets-list" element={<Layout><BasketsListPage /></Layout>} />
          <Route path="/basket/:id" element={<Layout><BasketPage /></Layout>} />
          <Route path="/portfolio" element={<Layout><PortfolioPage /></Layout>} />
          <Route path="/create-basket" element={<Layout><CreateBasketPage /></Layout>} />
          <Route path="/ppt" element={<PPTPage />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;
