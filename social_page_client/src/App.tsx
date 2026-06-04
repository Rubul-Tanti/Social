import { Route, Routes } from "react-router"
import Header from "./components/header"
import Login from "./components/auth/signin/signin"
import Register from "./components/auth/signup/signup"
import ForgotPassword from "./components/auth/forgot-password/forgot-password"
import CreatePost from "./components/createPost"
import AllPost from "./components/getAllPost"
import { ToastContainer } from "react-toastify"

const Home=()=>{
  return <>
<Header/>
<CreatePost/>
  <AllPost/>
  </>
}

function App() {
return <>
          <ToastContainer/>
<Routes>

  <Route path="/" element={<Home/>}/>
  <Route path="/signin" element={<Login/>}/>
  <Route path="/signup" element={<Register/>}/>
  <Route path="/forgot-password" element={<ForgotPassword/>}/>
</Routes>
</>
}
export default App
