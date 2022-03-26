const express = require('express')
const { get_users, set_condition } = require('../db.js')

const router = express.Router()

// Rutas internas
function protected_routes (req, res, next) {
  if (!req.session.user) {
    req.flash('errors', 'Debe ingresar al sistema primero')
    return res.redirect('/login')
  }
  next()
}

router.get('/admin', protected_routes, async (req, res) => {
  const user = req.session.user
  // me traigo a lista de todos los usuarios
  const users = await get_users()
  res.render('admin.html', { user, users })
});

router.get('/', protected_routes, async(req, res) => {
  const user = req.session.user
  const users = await get_users()
  res.render('index.html', { users })
});

router.put('/users/:id', async (req, res) => {

  await set_condition(req.params.id, req.body.new_condition)

  res.json({todo: 'ok'})
})


router.get('/datos', protected_routes, (req, res) => {
  const user = req.session.user
  res.render('datos.html', { user })
});

router.get('/lista', protected_routes, async (req, res) => {
  const user = req.session.user
  const users = await get_users()
//  console.log(user)
  res.render('index.html', { users })
});



module.exports = router