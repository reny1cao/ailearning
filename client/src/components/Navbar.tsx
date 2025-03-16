import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const { user, signOut } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="max-w-[95%] mx-auto px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="text-[#333333] text-lg md:text-xl font-light tracking-tight"
          >
            ai.learning
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-600" />
            ) : (
              <Menu className="w-6 h-6 text-gray-600" />
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/courses"
              className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
            >
              Courses
            </Link>

            <Link
              to="/ai-companion-demo"
              className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
            >
              AI Companion Demo
            </Link>

            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/auth"
                className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg py-4">
            <div className="flex flex-col space-y-4 px-6">
              <Link
                to="/courses"
                className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                Courses
              </Link>

              <Link
                to="/ai-companion-demo"
                className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                AI Companion Demo
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="text-[#333333] text-sm font-light hover:text-[#4169E1] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
