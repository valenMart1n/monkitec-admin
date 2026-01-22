import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Header from "./components/Header/Header";
import './App.css';
import ProductList from "./components/Product_List/ProductList";
import Product from "./components/Product/Product";
import CategoryList from "./components/CategoryList/CategoryList";
import CategoryDetail from "./components/CategoryList/CategoryDetail/CategoryDetail";
import VariationsList from "./Variation/VariationsList/VariationsList";
import Error404 from "./components/Error404/Error404";
import User from "./components/User/User";
import Login from "./components/Login/Login";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute";

function App() {
  return (<div>
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<Login/>}/>
    
        <Route path="/home" element={
          <PrivateRoute>
            <Home/>
          </PrivateRoute>    
        }/>
        <Route path="/products" element={
          <PrivateRoute>
          <ProductList/>
          </PrivateRoute>
        }/>
        <Route path="/product/:id" element={
          <PrivateRoute>
          <Product/>
          </PrivateRoute>
        }/>
        <Route path="/products/create" element={
          <PrivateRoute>
          <Product/>
          </PrivateRoute>
        }/>
        <Route path="/categories" element={
          <PrivateRoute>
          <CategoryList/>
          </PrivateRoute>
        }/>
        <Route path="/category/:id" element={
          <PrivateRoute>
          <CategoryDetail/>
          </PrivateRoute>
        }/>
        <Route path="/categories/create" element={
          <PrivateRoute>
          <CategoryDetail/>
          </PrivateRoute>
        }/>
        <Route path="/variations" element={
          <PrivateRoute>
          <VariationsList/>
          </PrivateRoute>
        }/>
        <Route path="/users" element={
          <PrivateRoute>
          <User/>
          </PrivateRoute>
        }/>
        
        <Route path="*" element={<Error404/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
