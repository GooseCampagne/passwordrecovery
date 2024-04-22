const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'XII'
});
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Conectado a la base de datos MySQL');
});
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'gustavodante202@gmail.com',
    pass: 'wcii ersc urkh ksot'
  }
});
const generateUniqueCode = () => {
  return crypto.randomBytes(6).toString('hex').toUpperCase(); 
};

app.post('/login', (req, res) => {
  const { correo, contrasena } = req.body;
  const query = `SELECT * FROM usuarios WHERE correo = ? AND contrasena = ?`;
  db.query(query, [correo, contrasena], (err, result) => {
    if (err) {
      res.status(500).send('Error al buscar usuario en la base de datos');
      return;
    }
    if (result.length > 0) {
      res.status(200).send('Inicio de sesión exitoso');
    } else {
      res.status(401).send('Credenciales incorrectas');
    }
  });
});

app.post('/reset-password', (req, res) => {
  const { correo } = req.body;
  const checkEmailQuery = 'SELECT * FROM usuarios WHERE correo = ?';
  db.query(checkEmailQuery, [correo], (err, result) => {
    if (err) {
      console.error('Error al buscar el correo en la base de datos:', err);
      res.status(500).json({ success: false, message: 'Error al buscar el correo en la base de datos' });
      return;
    }
    if (result.length === 0) {
      res.status(404).json({ success: false, message: 'El correo electrónico no está registrado' });
      return;
    }
    const codigo = generateUniqueCode();
    const insertCodeQuery = 'INSERT INTO codigos_recuperacion (correo, codigo, expiracion) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))'; 
    db.query(insertCodeQuery, [correo, codigo], (err, _) => {
      if (err) {
        console.error('Error al insertar el código en la base de datos:', err);
        res.status(500).json({ success: false, message: 'Error al generar el código de recuperación' });
        return;
      }
      const mailOptions = {
        from: 'gustavodante202@gmail.com',
        to: correo,
        subject: 'Recuperación de contraseña',
        text: `Tu código de recuperación es: ${codigo}`
      };
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Error al enviar el correo electrónico:', error);
          res.status(500).json({ success: false, message: 'Error al enviar el correo electrónico de recuperación de contraseña' });
        } else {
          console.log('Correo electrónico de recuperación de contraseña enviado:', info.response);
          res.status(200).json({ success: true, message: 'Correo de recuperación de contraseña enviado' });
        }
      });
    });
  });
});


app.post('/verify-reset-code', (req, res) => {
  const { correo, codigo, nuevaContrasena } = req.body;
  const checkCodeQuery = 'SELECT * FROM codigos_recuperacion WHERE correo = ? AND codigo = ? AND expiracion > NOW()';
  db.query(checkCodeQuery, [correo, codigo], (err, result) => {
    if (err) {
      console.error('Error al verificar el código de recuperación:', err);
      res.status(500).json({ success: false, message: 'Error al verificar el código de recuperación' });
      return;
    }
    if (result.length === 0) {
      res.status(400).json({ success: false, message: 'El código de recuperación es inválido o ha expirado' });
      return;
    }
    const updatePasswordQuery = 'UPDATE usuarios SET contrasena = ? WHERE correo = ?';
    db.query(updatePasswordQuery, [nuevaContrasena, correo], (err, _) => {
      if (err) {
        console.error('Error al actualizar la contraseña:', err);
        res.status(500).json({ success: false, message: 'Error al actualizar la contraseña' });
        return;
      }
      const deleteCodeQuery = 'DELETE FROM codigos_recuperacion WHERE correo = ?';
      db.query(deleteCodeQuery, [correo], (err, _) => {
        if (err) {
          console.error('Error al eliminar el código de recuperación:', err);
          res.status(500).json({ success: false, message: 'Error al eliminar el código de recuperación' });
          return;
        }
        res.status(200).json({ success: true, message: 'Contraseña actualizada correctamente' });
      });
    });
  });
});



app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
