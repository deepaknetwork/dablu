import { Link, Navigate, Route, HashRouter as Router, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Rooms from './rooms'
import Profile from './profile'
import Home from './home'
import Room from './room'
import { useContext, useEffect } from 'react'
import userIdContext from './data'
import Login from './login'

function Navigation() {
    const location = useLocation();
    
    return (
        <nav style={{
            position: 'fixed',
            bottom: '20px',
            right: '0',
            display: 'flex',
            flexDirection: 'column',
            gap: '0',
            zIndex: 1000
        }}>
            <Link to="/room" style={{
                color: '#000000',
                padding: '8px 6px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.05em',
                textAlign: 'center',
                backgroundColor: location.pathname.startsWith('/room') ? '#FFD4B3' : '#f0f0f0'
            }}>
                ROOMS
            </Link>

            <Link to="/profile" style={{
                color: '#000000',
                padding: '8px 6px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.05em',
                textAlign: 'center',
                backgroundColor: location.pathname === '/profile' ? '#FFD4B3' : '#f0f0f0'
            }}>
                PROFILE
            </Link>

            <Link hidden to="/" style={{
                color: '#000000',
                padding: '8px 6px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '0.75rem',
                fontFamily: '"JetBrains Mono", monospace',
                letterSpacing: '0.05em',
                textAlign: 'center',
                backgroundColor: location.pathname === '/' ? '#FFD4B3' : '#f0f0f0'
            }}>
                HOME
            </Link>
        </nav>
    );
}

export default function MyRouter() {
    const {getUserID,setUserID} = useContext(userIdContext)
    
    return (
        <Router>
            {/* Brutalist Header */}
            <header style={{
                backgroundColor: '#FF6B35',
                padding: '0.5rem 1.5rem',
                borderBottom: '3px solid #000000',
                boxShadow: '0 3px 0 #000000'
            }}>
                <div style={{
                    fontSize: '1.5rem',
                    fontWeight: '900',
                    color: '#FFFFFF',
                    fontFamily: '"JetBrains Mono", monospace',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    textShadow: '2px 2px 0 #000000'
                }}>
                    DABLU
                </div>
            </header>

            {/* Main Content */}
            <Routes>
                {getUserID()? <Route path='/' element={<Navigate to="/room" replace />}></Route> : <Route path='/' element={<Login />}></Route>}
                {getUserID()&&<Route path='/profile' element={<Profile />}></Route>}
                {getUserID()&&<Route path='/room' element={<Rooms />}></Route>}
                {getUserID()&&<Route path='/room/:id' element={<Room />}></Route>}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            {/* Minimalist Bottom Right Navigation */}
            {getUserID() && <Navigation />}
        </Router>
    )
}
