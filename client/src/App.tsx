import React, { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { supabase } from "./lib/supabase";
import { useAuthStore } from "./store/authStore";
import { visibilityManager } from "./lib/visibilityManager";
import { applyRouterFixes } from "./lib/routerFix";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import Learn from "./pages/Learn";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AICompanionDemo from "./components/learning/ai/AICompanionDemo";

// RouterFix component to apply fixes when the router is available
const RouterFix = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Create a basic history object compatible with the applyRouterFixes function
    const history = {
      listen: (callback) => {
        // This is a simplified listener that doesn't actually listen
        // It's just to satisfy the type requirements
        return () => {};
      },
      location,
      replace: (newLocation) => {
        // Use navigate to replace the current location
        navigate(
          typeof newLocation === "string"
            ? newLocation 
            : newLocation.pathname +
                (newLocation.search || "") +
                (newLocation.hash || ""),
          { replace: true }
        );
      },
    };
    
    // Apply router fixes
    const cleanup = applyRouterFixes(history as any);
    
    return cleanup;
  }, [navigate, location]);
  
  return null;
};

function App() {
  const { setUser, setSession } = useAuthStore();
  const visibilityUnregisterRef = useRef<(() => void) | null>(null);
  const lastAuthCheckRef = useRef<number>(Date.now());

  useEffect(() => {
    const initAuth = async () => {
      // Check active session
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setUser(data.session?.user ?? null);
    };

    initAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    // Handle auth refreshing with visibility manager
    visibilityUnregisterRef.current = visibilityManager.register(
      "app-auth-refresh",
      (isVisible) => {
        if (isVisible) {
          const now = Date.now();
          // Only check auth every 10 seconds at most
          if (now - lastAuthCheckRef.current > 10000) {
            lastAuthCheckRef.current = now;
            
            // Add a delay to avoid race conditions with other handlers
            setTimeout(() => {
              supabase.auth.getSession().then(({ data }) => {
                if (data.session) {
                  // Only update if there's a real change in expiration
                  setSession((prevSession) => {
                    if (
                      !prevSession || 
                      prevSession.expires_at !== data.session?.expires_at
                    ) {
                      return data.session;
                    }
                    return prevSession;
                  });
                }
              });
            }, 2000);
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      if (visibilityUnregisterRef.current) {
        visibilityUnregisterRef.current();
        visibilityUnregisterRef.current = null;
      }
    };
  }, [setUser, setSession]);

  return (
    <Router>
      <RouterFix />
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/learn/:courseId/module/:moduleId" element={<Learn />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/ai-companion-demo" element={<AICompanionDemo />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
