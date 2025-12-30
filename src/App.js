import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home/Home";
import Header from "./components/Header/Header";
import './App.css';
import ProductList from "./components/Product_List/ProductList";
import Product from "./components/Product/Product";

function App() {
  return (<div>
    <BrowserRouter>
    <Header/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/products" element={<ProductList/>}/>
         <Route path="/product/:id" element={<Product/>}/>
      </Routes>
    </BrowserRouter>
    </div>
  );
}

export default App;
