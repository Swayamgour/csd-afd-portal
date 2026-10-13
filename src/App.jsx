import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import { Loader } from './components/States.jsx'
const Home = lazy(() => import('./pages/Home.jsx'))
const Products = lazy(() => import('./pages/Products.jsx'))
const ProductDetails = lazy(() => import('./pages/ProductDetails.jsx'))
const Search = lazy(() => import('./pages/Search.jsx'))
const Compare = lazy(() => import('./pages/Compare.jsx'))
const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const Cart = lazy(() => import('./pages/Cart.jsx'))
const Info = lazy(() => import('./pages/Info.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      {/* <a className="skip" href="#main">Skip to main content</a> */}
      <Header />
      <main id="main" tabIndex={-1}>
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/search" element={<Search />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/info/:topic" element={<Info />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </>
  )
}
