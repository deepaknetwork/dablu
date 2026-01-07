// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import { Link, Route, HashRouter as Router, Routes } from 'react-router-dom'
import './App.css'
// import Login from './login'
import Rooms from './rooms'
import Profile from './profile'
import Home from './home'
import Room from './room'
import { useEffect ,useState} from 'react'
import MyRouter from './router'
import userIdContext from './data'
import { LoadingProvider } from './loadingContext.jsx'
import LoadingSpinner from './LoadingSpinner'
import { ModalProvider } from './ModalContext.jsx'

function App() {
  
const [userID,setUserId] = useState(localStorage.getItem("Dablu.userID") ||null);


const getUserID = () => {
    return userID;
};

function setUserID(id){
    if(id === null){
        localStorage.removeItem("Dablu.userID");
        setUserId(null);
        return;
    }
    localStorage.setItem("Dablu.userID", id);
    setUserId(id);
}
// return the funtion in context


  return (
    <ModalProvider>
      <LoadingProvider>
        <userIdContext.Provider value={{ getUserID, setUserID }}>
          <MyRouter />
          <LoadingSpinner />
        </userIdContext.Provider>
      </LoadingProvider>
    </ModalProvider>
  )
}

export default App
