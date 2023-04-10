import React from 'react';
import { Route, Routes, HashRouter } from 'react-router-dom';
import { Login } from './pages/Login/Login';
import Main from './pages/Main/Main';
import Flow from './pages/Flow/Flow';


const Router = () => {
  return (
    <HashRouter>
      <Routes>

        <Route element={<Main />} path='/' />
        <Route element={<Login />} path='/login' />
        <Route element={<Flow />} path='/flow' />

      </Routes>
    </HashRouter>
  )
}

export default Router
