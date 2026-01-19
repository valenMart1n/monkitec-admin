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

function App() {
  return (<div>
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/products" element={<ProductList/>}/>
        <Route path="/product/:id" element={<Product/>}/>
        <Route path="/products/create" element={<Product/>}/>
        <Route path="/categories" element={<CategoryList/>}/>
        <Route path="/category/:id" element={<CategoryDetail/>}/>
        <Route path="/categories/create" element={<CategoryDetail/>}/>
        <Route path="/variations" element={<VariationsList/>}/>
        <Route path="*" element={<Error404/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
