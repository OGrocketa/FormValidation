import { useState } from 'react'
import './App.css'
import Register from './components/Register'
import Login from './components/Login'
import {Routes, Route } from "react-router-dom";
import Layout from './Layout';
import Unauthorized from './components/Unauthorized';
import Missing from './components/Missing';
import LinkPage from './components/LinkPage';
import Home from './components/Home';
import Editor from './components/Editor';
import Admin from './components/Admin';
import Lounge from './components/Lounge';
import RequireAuth from './components/RequireAuth';
import PersistLogin from './components/PersistLogin';


const Roles = {
  "User": 0,
  "Editor": 1,
  "Admin": 2
}


function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout/>}>
        {/* public routes */}
        <Route path='/linkpage' element={<LinkPage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path= '/unauthorized' element={<Unauthorized/>}/>
        

        <Route element={<PersistLogin/>}>
          {/* Private routes */}
          <Route element={<RequireAuth allowedRoles={[Roles.User, Roles.Admin, Roles.Editor]}/>}>
            <Route path='/' element= {<Home/>}/>
          </Route>

          <Route element={<RequireAuth allowedRoles={[Roles.Editor]}/>}>
            <Route path='/editor' element= {<Editor/>}/>
          </Route>

          <Route element={<RequireAuth allowedRoles={[Roles.Admin]}/>}>
            <Route path='/admin' element= {<Admin/>}/>
          </Route>

          <Route element={<RequireAuth allowedRoles={[Roles.Admin, Roles.Editor]}/>}>
            <Route path='/lounge' element= {<Lounge/>}/>
          </Route>
        </Route>
        
        {/* 404 not found */}
        <Route path='/404NotFound' element={<Missing/>}/>
      </Route>
    </Routes>
  )
}

export default App
