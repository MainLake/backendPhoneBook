// Inicializacion del servidor
// Importamos el modulo de express
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');



const requestLogger = (request, response, next) => {
    console.log('Method:', request.method)
    console.log('Path:  ', request.path)
    console.log('Body:  ', request.body)
    console.log('---')
    next()
}

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}


let persons = [
    {
        id: 1,
        name: "Arto Hellas",
        number: "040-123456"
    },
    {
        id: 2,
        name: "Ada Lovelace",
        number: "39-44-123123123"
    },
    {
        id: 3,
        name: "Dav Abramov",
        number: "12-43-13123124"
    }
]

// inicializamos la app de express
const app = express();

// Permitimos el uso de body como json
app.use(express.json());

// Hacer que express pueda servir archivos estaticos
app.use(express.static('build'));

// Habilidar las peticiones de otras ip
app.use(cors());

app.use(morgan(function (tokens, req, res) {
    
    return [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        tokens['response-time'](req, res), 'ms',
        JSON.stringify(req.body)
    ].join(' ')
}));

const generateId = () => {
    const maxId = Math.max(...persons.map(person => person.id));
    return maxId + 1;
}

app.get('/', (request, response) => {
    response.send('<h1>Backend express</h1>')
});

app.get('/api/persons', (request, response) => {
    response.json(persons);
});

app.get('/info', (request, response) => {
    const stringInfo = `<div><p>PhoneBook has info for ${persons.length} people</p><p>${new Date()}</p></div>`;
    response.send(stringInfo)
});

// Para acceder a los parametros pasados por la url es necesario hacerlo 
// por medio de la request accediendo a la propieda de params posterio acceder a la propiedad
app.get('/api/persons/:id', (request, response) => {

    const id = Number(request.params.id)
    const person = persons.find(n => n.id === id);

    if (!person) {
        return response.status(404).json({
            error: "content missing"
        });

    }

    return response.json(person);

});

app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id);
    persons = persons.filter(person => person.id !== id);
    return response.status(204).end();
});

app.post('/api/persons', (request, response) => {
    const name = request.body.name;
    const number = request.body.number;

    if (!name || !number) {
        return response.status(404).json({
            error: "Falta nombre o numero"
        });
    }

    if (persons.some(person => person.name.trim() === name.trim())) {
        return response.status(409).json({
            error: "Nombre ya existente"
        });
    }

    const newPerson = {
        id: generateId(),
        name: name,
        number: number
    }

    persons = persons.concat(newPerson);
    return response.json(newPerson);
});

app.use(unknownEndpoint);

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
    console.log(`Run server in port ${PORT}`)
});
