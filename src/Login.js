import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loggedIn, setLoggedIn] = useState(false); 
  const [error, setError] = useState(null); 

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleLogin = async () => {
    if (!validateEmail(correo)) {
      setError('El correo electrónico no es válido');
      return;
    }

    if (!contrasena) {
      setError('La contraseña es requerida');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, contrasena })
      });

      if (response.ok) {
        setLoggedIn(true);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
    }
  };

  if (loggedIn) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Iniciar sesión</h2>
        <input type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        <input type="password" placeholder="Contraseña" value={contrasena} onChange={(e) => setContrasena(e.target.value)} />
        <button onClick={handleLogin}>Iniciar sesión</button>
        {error && <p>{error}</p>} 
        <Link to="/reset-password">¿Olvidaste tu contraseña?</Link>
      </div>
    </div>
  );
};

export default Login;

