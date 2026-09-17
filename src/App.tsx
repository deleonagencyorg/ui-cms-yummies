import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import ProtectedRoute from '@/components/ProtectedRoute'

// Public pages
import Home from '@/pages/Home'
import Login from '@/pages/Login'
import ForgotPassword from '@/pages/ForgotPassword'
import ResetPassword from '@/pages/ResetPassword'

// Protected pages
import Dashboard from '@/pages/Dashboard'
import Profile from '@/pages/Profile'
import Settings from '@/pages/Settings'
import Languages from '@/pages/Languages'
import Departments from '@/pages/Departments'
import Profiles from '@/pages/Profiles'
import JobTitles from '@/pages/JobTitles'
import Brands from '@/pages/Brands'
import Products from '@/pages/Products'
import Recipes from '@/pages/Recipes'
import TopMessages from '@/pages/TopMessages'
import News from '@/pages/News'
import Multimedia from '@/pages/Multimedia'
import Sites from '@/pages/Sites'
import Pages from '@/pages/Pages'
import ChangePassword from '@/pages/ChangePassword'
import Health from './pages/Health'
import Descubrenos from './pages/Descubrenos'
import Contact from './pages/Contact'
import Footer from './pages/Footer'
import ApiTokens from './pages/ApiTokens'
import Navigation from './pages/Navigation'
import SocialMedia from './pages/SocialMedia'
import Modals from './pages/Modals'
import ContentLists from './pages/ContentLists'
import SiteTexts from './pages/SiteTexts'
import ZambosTruck from './pages/ZambosTruck'
import ProductCategories from './pages/ProductCategories'
import SiteSettings from './pages/SiteSettings'
import Gallery from './pages/Gallery'

function App() {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />
      <Route
        path="/forgot-password"
        element={isAuthenticated ? <Navigate to="/" replace /> : <ForgotPassword />}
      />
      <Route
        path="/reset-password"
        element={isAuthenticated ? <Navigate to="/" replace /> : <ResetPassword />}
      />

      {/* Protected routes */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute skipPasswordCheck>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/languages"
        element={
          <ProtectedRoute>
            <Languages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/departments"
        element={
          <ProtectedRoute>
            <Departments />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profiles"
        element={
          <ProtectedRoute>
            <Profiles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job-titles"
        element={
          <ProtectedRoute>
            <JobTitles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/brands"
        element={
          <ProtectedRoute>
            <Brands />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/recipes"
        element={
          <ProtectedRoute>
            <Recipes />
          </ProtectedRoute>
        }
      />
      <Route
        path="/top-messages"
        element={
          <ProtectedRoute>
            <TopMessages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/multimedia"
        element={
          <ProtectedRoute>
            <Multimedia />
          </ProtectedRoute>
        }
      />
      <Route
        path="/multimedia/folder/:folderId"
        element={
          <ProtectedRoute>
            <Multimedia />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sites"
        element={
          <ProtectedRoute>
            <Sites />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pages"
        element={
          <ProtectedRoute>
            <Pages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/news"
        element={
          <ProtectedRoute>
            <News />
          </ProtectedRoute>
        }
      />
      <Route
        path="/health"
        element={
          <ProtectedRoute>
            <Health />
          </ProtectedRoute>
        }
      />
      <Route
        path="/descubrenos"
        element={
          <ProtectedRoute>
            <Descubrenos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
      <Route
        path="/footer"
        element={
          <ProtectedRoute>
            <Footer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/api-tokens"
        element={
          <ProtectedRoute>
            <ApiTokens />
          </ProtectedRoute>
        }
      />
      <Route
        path="/navigation"
        element={
          <ProtectedRoute>
            <Navigation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/social-media"
        element={
          <ProtectedRoute>
            <SocialMedia />
          </ProtectedRoute>
        }
      />
      <Route
        path="/modals"
        element={
          <ProtectedRoute>
            <Modals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/content-lists"
        element={
          <ProtectedRoute>
            <ContentLists />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-texts"
        element={
          <ProtectedRoute>
            <SiteTexts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/zambos-truck"
        element={
          <ProtectedRoute>
            <ZambosTruck />
          </ProtectedRoute>
        }
      />
      <Route
        path="/product-categories"
        element={
          <ProtectedRoute>
            <ProductCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/site-settings"
        element={
          <ProtectedRoute>
            <SiteSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <Gallery />
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect based on auth state */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  )
}

export default App