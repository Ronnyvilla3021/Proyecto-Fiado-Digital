const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { Op } = require('sequelize');
const Usuario = require('../models/Usuario');
const enviarEmail = require('../config/mailer');

// REGISTRO
const registrar = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }

    const usuarioExistente = await Usuario.findOne({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ error: 'Este email ya está registrado' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordEncriptada = await bcrypt.hash(password, salt);
    const tokenVerificacion = crypto.randomBytes(32).toString('hex');

    const nuevoUsuario = await Usuario.create({
      nombre,
      email,
      password: passwordEncriptada,
      rol: rol || 'cajero',
      token_verificacion: tokenVerificacion,
    });

    // Enviar email de verificación
    const linkVerificacion = `${process.env.FRONTEND_URL}/verificar-email/${tokenVerificacion}`;
    await enviarEmail({
      to: email,
      subject: 'Verifica tu cuenta - Fiado Digital',
      html: `
        <h2>¡Bienvenido a Fiado Digital, ${nombre}!</h2>
        <p>Por favor confirma tu cuenta haciendo click en el siguiente enlace:</p>
        <a href="${linkVerificacion}">Verificar mi cuenta</a>
        <p>Si no creaste esta cuenta, ignora este mensaje.</p>
      `,
    });

    res.status(201).json({
      mensaje: 'Usuario registrado correctamente. Revisa tu email para verificar tu cuenta.',
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        rol: nuevoUsuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// VERIFICAR EMAIL
const verificarEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const usuario = await Usuario.findOne({ where: { token_verificacion: token } });
    if (!usuario) {
      return res.status(400).json({ error: 'Token de verificación inválido o ya usado' });
    }

    usuario.email_verificado = true;
    usuario.token_verificacion = null;
    await usuario.save();

    res.json({ mensaje: 'Email verificado correctamente. Ya puedes iniciar sesión.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al verificar el email' });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    if (!usuario.email_verificado) {
      return res.status(403).json({ error: 'Debes verificar tu email antes de iniciar sesión' });
    }

    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      mensaje: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// SOLICITAR RECUPERACIÓN DE CONTRASEÑA
const solicitarRecuperacion = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'El email es obligatorio' });
    }

    const usuario = await Usuario.findOne({ where: { email } });

    // Por seguridad, respondemos igual exista o no el usuario (no revelamos si el email está registrado)
    if (!usuario) {
      return res.json({ mensaje: 'Si el email existe, se enviará un enlace de recuperación' });
    }

    const tokenRecuperacion = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    usuario.token_recuperacion = tokenRecuperacion;
    usuario.token_recuperacion_expira = expira;
    await usuario.save();

    const linkRecuperacion = `${process.env.FRONTEND_URL}/restablecer-password/${tokenRecuperacion}`;
    await enviarEmail({
      to: email,
      subject: 'Recuperar contraseña - Fiado Digital',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña. Este enlace expira en 1 hora:</p>
        <a href="${linkRecuperacion}">Restablecer contraseña</a>
        <p>Si no solicitaste esto, ignora este mensaje.</p>
      `,
    });

    res.json({ mensaje: 'Si el email existe, se enviará un enlace de recuperación' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al solicitar recuperación' });
  }
};

// RESTABLECER CONTRASEÑA
const restablecerPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'La nueva contraseña es obligatoria' });
    }

    const usuario = await Usuario.findOne({
      where: {
        token_recuperacion: token,
        token_recuperacion_expira: { [Op.gt]: new Date() }, // que no haya expirado
      },
    });

    if (!usuario) {
      return res.status(400).json({ error: 'Token inválido o expirado' });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.password = await bcrypt.hash(password, salt);
    usuario.token_recuperacion = null;
    usuario.token_recuperacion_expira = null;
    await usuario.save();

    res.json({ mensaje: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al restablecer la contraseña' });
  }
};

module.exports = {
  registrar,
  login,
  verificarEmail,
  solicitarRecuperacion,
  restablecerPassword,
};