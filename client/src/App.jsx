import { Route, Routes } from 'react-router'
import './App.css'
import Header from './components/Header'
import Home from './pages/Home'
import Product from './pages/Product'
import Footer from './components/Footer'

function App() {

  return (
    <>
    <Header />

    <div className="content">
      <Routes>
        {/* <Route path="" Component={Home} />
        <Route path="/product" Component={Product} /> */}
        <Route path="/" Component={Product} />
      </Routes>
    </div>

    <Footer />
    </>
  )
}

export default App
