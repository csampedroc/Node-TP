const express = require('express');
const mysql = require('mysql');
const util = require('util');
const cors = require('cors');
const app = express();
const port = 3333;
app.use(express.json());

// Conexion a la BBDD

const conexion = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root123#',
    database: 'books',
});

conexion.connect((error) => {
    if (error) {
        throw error;
    }

    console.log('Conexion con la base de datos establecida');
});

const query = util.promisify(conexion.query).bind(conexion);

app.listen(port, () => {
    console.log('Servidor escuchando en puerto', port);
});

//termina la conexion a la BBDD

///Categoria

app.post('/categoria', async (req, res) => {
    try {
        if (!req.body.nombre) {
            throw {
                name: 'fdatos',
                message: 'Faltan datos',
            };
        }
        const nombre = req.body.nombre.toUpperCase();

        let respuesta = await query('select id from categoria where nombre=?', [
            nombre,
        ]);
        if (respuesta.length > 0) {
            throw {
                name: 'catexis',
                message: 'ese nombre de categoria ya existe',
            };
        }

        const inserta = await query(
            'insert into categoria (nombre) values (?)',
            [nombre]
        );
        const registroNuevo = await query(
            'select * from categoria where id=?',
            [inserta.insertId]
        );
        res.status(200).json(registroNuevo[0]);
    } catch (e) {
        if (e.name == 'fdatos') {
            res.status(413).send({ Error: e.message });
        } else if (e.name == 'catexis') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});

app.get('/categoria', async (req, res) => {
    try {
        let respuesta = await query('select * from categoria order by id');
        if (respuesta.length > 0) {
            res.json(respuesta);
        } else {
            res.status(413).json(respuesta);
        }
    } catch (error) {
        res.send('Error');
    }
});

///si le pasamos el ID de la categoria nos devuelve el Json de la categoria

app.get('/categoria/:id', async (req, res) => {
    try {
        let respuesta = await query('select * from categoria where id=?', [
            req.params.id,
        ]);

        if (respuesta.length !== 1) {
            throw {
                name: 'catnoe',
                message: 'Categoria no encontrada',
            };
        }
        res.json(respuesta[0]);
    } catch (e) {
        if (e.name == 'catnoe') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});

///Si le pasamos el ID a borrar, borra el registro

app.delete('/categoria/:id', async (req, res) => {
    try {
        const registro = await query('select * from categoria where id=?', [
            req.params.id,
        ]);
        if (registro.length < 1) {
            throw {
                name: 'noexcat',
                message: 'no existe la categoria indicada',
            };
        }
        const consulta = await query(
            'select categoria_id from libros where categoria_id=?',
            [req.params.id]
        );
        if (consulta.length > 0) {
            throw {
                name: 'catnovacia',
                message: 'categoria con libros asociados, no se puede eliminar',
            };
        }

        await query('delete from categoria where id=?', [req.params.id]);
        res.status(200).json('se borro correctamente');
    } catch (e) {
        if (e.name == 'noexcat') {
            res.status(413).send({ Error: e.message });
        } else if (e.name == 'catnovacia') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});

///Persona

app.post('/persona', async (req, res) => {
    try {
        if (
            !req.body.nombre ||
            !req.body.apellido ||
            !req.body.alias ||
            !req.body.email
        ) {
            throw {
                name: 'fdatos',
                message: 'faltan datos',
            };
        }

        const Persona = {
            nombre: req.body.nombre.toUpperCase(),
            apellido: req.body.apellido.toUpperCase(),
            alias: req.body.alias,
            email: req.body.email,
        };

        let consulta = await query('select email from persona where email=?', [
            Persona.email,
        ]);

        if (consulta.length > 0) {
            throw {
                name: 'exemail',
                message: 'el email ya se encuentra registrado',
            };
        }

        let nuevoregistro = await query(
            'INSERT INTO persona (NOMBRE,APELLIDO,ALIAS,EMAIL) VALUES (?,?,?,?)',
            [Persona.nombre, Persona.apellido, Persona.alias, Persona.email]
        );

        const muestraNuevoReg = await query(
            'select * from persona where id=?',
            [nuevoregistro.insertId]
        );
        res.status(200).json(muestraNuevoReg[0]);
    } catch (e) {
        if (e.name == 'fdatos') {
            res.status(413).send({ Error: e.message });
        } else if (e.name == 'exemail') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});

app.get('/persona', async (req, res) => {
    try {
        let respuesta = await query('select * from persona order by id');
        if (respuesta.length > 0) {
            res.json(respuesta);
        } else {
            res.status(413).json(respuesta);
        }
    } catch (error) {
        console.log('error');
    }
});

app.get('/persona/:id', async (req, res) => {
    try {
        let respuesta = await query('select * from persona where id=?', [
            req.params.id,
        ]);

        if (respuesta.length !== 1) {
            throw {
                name: 'pernoe',
                message: 'no se encuentra esa persona',
            };
        }
        res.json(respuesta[0]);
    } catch (e) {
        if (e.name == 'pernoe') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});

app.put('/persona/:id', async (req, res) => {
    try {
        let email = req.body.email;
        let consulta = await query(
            'select * from persona where email=? AND id=?',
            [email, req.params.id]
        );
        if (consulta.length != 1) {
            throw {
                name: 'noemail',
                message: 'no se encuentra esa persona',
            };
        }

        let actualiza = await query(
            'update persona set nombre=?,apellido=?,alias=? where id=?',
            [
                req.body.nombre.toUpperCase(),
                req.body.apellido.toUpperCase(),
                req.body.alias,
                req.params.id,
            ]
        );

        let registromod = await query('select * from persona where email=?', [
            email,
        ]);
        res.status(200).json(registromod[0]);
        //res.json(registromod[0])
    } catch (e) {
        if (e.name == 'noemail') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});

app.delete('/persona/:id', async (req, res) => {
    try {
        const registro = await query('select * from persona where id=?', [
            req.params.id,
        ]);
        if (registro.length < 1) {
            throw {
                name: 'noexper',
                message: 'no existe esa persona',
            };
        }
        const consulta = await query(
            'select persona_id from libros where persona_id=?',
            [req.params.id]
        );
        if (consulta.length > 0) {
            throw {
                name: 'pernovacia',
                message:
                    'esa persona tiene libros asociados, no se puede eliminar',
            };
        }

        await query('delete from persona where id=?', [req.params.id]);
        res.status(200).json('se borro correctamente');
    } catch (e) {
        if (e.name == 'noexper') {
            res.status(413).send({ Error: e.message });
        } else if (e.name == 'pernovacia') {
            res.status(413).send({ Error: e.message });
        } else {
            res.status(413).send({ 'Error inesperado': e.message });
        }
    }
});
