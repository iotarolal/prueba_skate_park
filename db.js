const { Pool } = require('pg')

// creamos nuestro pool de conexiones
const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'skatepark',
  password: '1234',
  max: 12,
  min: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

/* Inicio de session */
/* Obtengo un usuario por su email, o undefined si este no existe en la tabla "skaters" */
async function get_user(email) {
  const client = await pool.connect()

  const { rows } = await client.query({
    text: 'select * from skaters where email=$1',
    values: [email]
  })

  client.release()

  if (rows.length > 0) {
    return rows[0]
  }
  return undefined
}

/* Registro de Usuario */
async function create_user(email, nombre, password, anos_experiencia, especialidad, foto) {
  const client = await pool.connect()

  await client.query({
    text: 'insert into skaters (email, nombre, password, anos_experiencia, especialidad, foto, estado) values ($1, $2, $3, $4, $5, $6, $7)',
    values: [email, nombre, password, anos_experiencia, especialidad, foto, true]
  })

  client.release()
}

async function get_users() {
  const client = await pool.connect()

  const { rows } = await client.query('select * from skaters order by id')

  client.release()

  return rows
}

async function set_condition(user_id, new_condition) {
  const client = await pool.connect()

  await client.query({
    text: 'update skaters set estado=$2 where id=$1',
    values: [parseInt(user_id), new_condition]
  })

  client.release()
}

//  modifica perfil de usuario
async function modify_user(email, name, password_encrypt, year_experience) {
  const client = await pool.connect()

  await client.query({
    text: 'update skaters set  nombre = $2 , password = $3, anos_experiencia = $4  where  email = $1',
    values: [email, name, password_encrypt, year_experience]
  })

  client.release()

}


// Elimina un usuario
async function eliminarusuario(email) {
  const client = await pool.connect()

  const res = await client.query(
      "delete from skaters where email=$1",
      [email]
  )
  client.release();
}    



module.exports = {
  get_user,
  create_user,
  get_users,
  set_condition,
  modify_user,
  eliminarusuario
}
