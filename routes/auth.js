const express = require('express')
const bcrypt = require('bcrypt')
const { get_user, create_user, modify_user, eliminarusuario } = require('../db.js')

const router = express.Router()


// Rutas de Auth (externas)
router.get('/login', (req, res) => {
  const errors = req.flash('errors')
  res.render('login.html', { errors })
});

router.post('/login', async (req, res) => {
  // 1. Recuperar los valores del formulario
  const email = req.body.email
  const password = req.body.password

  // 2. Validar que usuario sí existe
  const user = await get_user(email)
  if (!user) {
    req.flash('errors', 'Usuario no existe o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 3. Validar que contraseña coincida con lo de la base de datos
  const son_iguales = await bcrypt.compare(password, user.password)
  if ( !son_iguales ) {
    req.flash('errors', 'Usuario no existe o contraseña incorrecta')
    return res.redirect('/login')
  }

  // 4. Guardamos el usuario en sesión
  req.session.user = user
  res.redirect('/')
});

router.get('/register', (req, res) => {
  const errors = req.flash('errors')
  res.render('registro.html', { errors })
});

router.post('/register', async (req, res) => {
  // 1. Recuperamos los valores del formulario
  const email = req.body.email
  const name = req.body.name
  const password = req.body.password
  const password_confirm = req.body.password_confirm
  const year_experience = req.body.year_experience
  const specialty = req.body.specialty
  const photo = req.body.photo

  // 2. validar que contraseñas sean iguales
  if (password != password_confirm) {
    req.flash('errors', 'La contraseñas no coinciden')
    return res.redirect('/register')
  }

  // 3. validar que email no exista previamente
  const user = await get_user(email)
  if (user) {
    req.flash('errors', 'Usuario ya existe o contraseña incorrecta')
    return res.redirect('/register')
  }

  const password_encrypt = await bcrypt.hash(password, 10)
  await create_user(email, name, password_encrypt,  year_experience, specialty, photo)

  // 4. Guardo el nuevo usuario en sesión
  req.session.user = { name, email, password }
  res.redirect('/')
});

router.get('/logout', (req, res) => {
  // 1. Eliminamos al usuario de la sesión
  req.session.user = undefined
  // 2. Lo mandamos al formulario de login
  res.redirect('/login')
})

// modifica  o elimina perfil 
router.post('/datos', async (req, res) => {
  // 1. Recuperamos los valores del formulario
  const email = req.session.user.email
  const name = req.body.name
  const password = req.body.password
  const password_confirm = req.body.password_confirm
  const year_experience = req.body.year_experience

  // 2. validar que contraseñas sean iguales
  if (password != password_confirm) {
    req.flash('errors', 'La contraseñas no coinciden')
    return res.redirect('/perfil')
  }

  const password_encrypt = await bcrypt.hash(password, 10)
//  console.log(password_encrypt);
  await modify_user(email, name, password_encrypt, year_experience);

  // 4. Guardo el nuevo usuario en sesión
  req.session.user = { name, email, password };
  res.redirect('/')
});

router.get('/eliminar/:email', async (req, res) => {
  // 1. Recuperamos los valores del formulario
  console.log(req.params.email)
  await eliminarusuario(req.params.email);
  res.redirect('/logout')
});


module.exports = router