//1- LLAMAMOS A EXPRESS 
const express = require('express');
const app = express();
const port = 3000;

//2- USAMOS EL MIDDLEWARE PARA RECIBIR Y ENVIAR DATOS EN FORMATO JSON
//SETEAMOS URLENCODED PARA RECIBIR DATOS DEL FORMULARIO
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//3- LLAMAMOS A DOTENV
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

//4- SETEAMOS EL DIRECTORIO PUBLIC
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//5- SETEAMOS EL MOTOR DE PLANTILLAS 
app.set('view engine', 'ejs');

//6- INVOCAMOS A BYCRYPTJS
const bcrypt = require('bcryptjs');

//7- VAR DE SESSIONES
const session =  require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));

//8- CONEXION A LA BASE DE DATOS
const connection = require('./database/db');

//9- CREAMOS LA RUTA PRINCIPAL


app.get('/login', (req, res) => {
    res.render('login');
});
app.get('/register', (req, res) => {
    res.render('register');
});

//10- A��ADIMOS LA RUTA PARA EL LOGIN

app.post('/register', async (req, res) => {
    const user =req.body.user;
    const name =req.body.name;
    const rol =req.body.rol;
    const pass =req.body.pass;
    let passwordHash = await bcrypt.hash(pass, 8);
    connection.query('INSERT INTO users SET?', {user:user,name:name, rol:rol, pass: passwordHash}, (err, result) => {
        if (err){
            console.log(err)
        }else{
            res.render('register',{
                alert: true,
                alertTitle: "Registration",
                alertMessage: "Successfull registration",
                alertIcon: "success",
                showConfirmButton:false,
                timer:1500,
                ruta: ''
            });
        }

        // console.log(`User ${name} added with id: ${result.insertId}`);
        // res.send('EXITOSA');
        
    });

});

//11- SETEAMOS LA RUTA PARA EL LOGIN

app.post('/auth', async (req, res) => {
    const user = req.body.user;
    const pass = req.body.pass;

    let passwordHash = await bcrypt.hash(pass, 8);
    if(user && pass){
    connection.query('SELECT * FROM users WHERE user =?', [user], async (err, result) => { 
        if(result.length == 0 || !(await bcrypt.compare(pass, result[0].pass))){
            res.render('login', {
                alert: true,
                alertTitle: "Error",
                alertMessage: "Invalid credentials",
                alertIcon: "error",
                showConfirmButton:false,
                timer:false,
                ruta: 'login'
            });
        }else{
            req.session.loggedIn = true;
             req.session.name = result[0].name;
             res.render('login', {
                alert: true,
                alertTitle: "Connection exitosa",
                alertMessage: "Correcta credentials",
                alertIcon: "success",
                showConfirmButton:false,
                timer:1500,
                ruta: ''
            });
        }
    })
    }else{
        res.render('login', {
            alert: true,
            alertTitle: "Advertencia",
            alertMessage: "Ingrese un usuario o contraseña",
            alertIcon: "warning",
            showConfirmButton:true,
            timer:false,
            ruta: 'login'
        });
    }
})

//12- auth page

app.get('/', (req, res) => {
    if (req.session.loggedIn) {
        res.render('index', {
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index', {
            login: false,
            name: 'DEBE INICIAR SESSION'
        });
    }
});

//13- SALIR

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.log(err);
        } else {
            res.render('index', {
                login: false,
                name: 'SE HA CERRADO LA SESION'
            });
        }
    });
});


// vista crud 



app.get('/add', (req, res) => {
    res.render('add');
});
// console.log('DB_HOST:', process.env.DB_HOST);
// console.log('DB_USER:', process.env.DB_USER);
// console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : '(empty)');
// console.log('DB_DATABASE:', process.env.DB_DATABASE);







app.listen(port, (req, res) => {
    console.log(`🚀 SERVER RUNNING IN http://localhost:${port}`);
});
