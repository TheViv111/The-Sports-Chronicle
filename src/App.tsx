import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { TranslationProvider } from "@/contexts/TranslationContext";
import { SessionContextProvider } from "@/components/SessionContextProvider";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import SignIn from "./pages/SignIn"; // Import SignIn
import SignUp from "./pages/SignUp"; // Import SignUp
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <TooltipProvider>
        <TranslationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <SessionContextProvider>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="blog" element={<Blog />} />
                  <Route path="blog/:slug" element={<BlogPost />} />
                  <Route path="about" element={<About />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="signin" element={<SignIn />} /> {/* New SignIn route */}
                  <Route path="signup" element={<SignUp />} /> {/* New SignUp route */}
                  <Route path="profile" element={<Profile />} />
                </Route>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </SessionContextProvider>
          </BrowserRouter>
        </TranslationProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;