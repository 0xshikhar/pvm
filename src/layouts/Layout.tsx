import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

export function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: "/", label: "Baskets", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
    { path: "/portfolio", label: "Portfolio", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TB</span>
              </div>
              <span className="text-xl font-bold text-white">TeleBasket</span>
            </Link>

            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? "bg-blue-600 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="flex items-center space-x-4">
              <NetworkSelector />
              <WalletButton />
              
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700 py-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-2 text-sm font-medium ${
                  isActive(link.path)
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      <main>{children}</main>

      <footer className="bg-gray-800 border-t border-gray-700 mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">TB</span>
              </div>
              <span className="text-gray-400 text-sm">TeleBasket © 2026</span>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Docs</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
              <a href="#" className="hover:text-white transition-colors">Discord</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function NetworkSelector() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState("Westend");

  const networks = [
    { name: "Westend", color: "bg-orange-500" },
    { name: "Polkadot Hub", color: "bg-red-500" },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
      >
        <span className={`w-2 h-2 rounded-full ${networks.find(n => n.name === selected)?.color}`} />
        <span className="text-sm text-white">{selected}</span>
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-gray-700 rounded-lg shadow-xl border border-gray-600 py-1 z-50">
          {networks.map((network) => (
            <button
              key={network.name}
              onClick={() => {
                setSelected(network.name);
                setOpen(false);
              }}
              className="flex items-center space-x-2 w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-white"
            >
              <span className={`w-2 h-2 rounded-full ${network.color}`} />
              <span>{network.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function WalletButton() {
  const [connected, setConnected] = useState(false);

  if (connected) {
    return (
      <button className="flex items-center space-x-2 px-4 py-2 bg-green-600/20 border border-green-600/50 rounded-lg hover:bg-green-600/30 transition-colors">
        <span className="w-2 h-2 bg-green-400 rounded-full" />
        <span className="text-sm text-green-400">0x1234...5678</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => setConnected(true)}
      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
    >
      Connect Wallet
    </button>
  );
}
