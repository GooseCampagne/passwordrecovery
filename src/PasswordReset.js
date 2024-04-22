import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import './passwordReset.css';

const PasswordReset = () => {
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [message, setMessage] = useState('');
  const [step, setStep] = useState(1);
  const [redirect, setRedirect] = useState(false);
  const [correoValido, setCorreoValido] = useState(true);

  const handleReset = async () => {
    if (!validateEmail(correo)) {
      setCorreoValido(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setStep(2);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setMessage('Error al procesar la solicitud. Por favor, intenta nuevamente.');
    }
  };

  const handleVerifyCode = async () => {
    try {
      const response = await fetch('http://localhost:5000/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ correo, codigo, nuevaContrasena })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setRedirect(true);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      console.error('Error al procesar la solicitud:', error);
      setMessage('Error al procesar la solicitud. Por favor, intenta nuevamente.');
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="password-reset-container">
      <div className="password-reset-wrapper">
        <div className="password-reset-form">
          <h2>Recuperar contraseña</h2>
          {step === 1 && (
            <div className="step-1">
              <input type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} />
              {!correoValido && <p className="error-message">Por favor, introduce un correo electrónico válido.</p>}
              <button onClick={handleReset}>Recuperar contraseña</button>
            </div>
          )}
          {step === 2 && (
            <div className="step-2">
              <p>{message}</p>
              <input type="text" placeholder="Código de recuperación" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
              <input type="password" placeholder="Nueva contraseña" value={nuevaContrasena} onChange={(e) => setNuevaContrasena(e.target.value)} />
              <button onClick={handleVerifyCode}>Verificar código y cambiar contraseña</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordReset;
