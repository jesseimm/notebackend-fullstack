const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => { // cors package could also be used
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

const morgan = require('morgan');

morgan.token('body', req => JSON.stringify(req.body));
const loggerFormat = ':method :url :body :status :response-time';

app.use(morgan(loggerFormat, {
    stream: process.stdout,
}));

let persons = [
    {
        name: 'Arto Hellas',
        number: '040-123456',
        id: 1,
    },
    {
        name: 'Martti Tienari',
        number: '040-123456',
        id: 2,
    },
    {
        name: 'Arto Järvinen',
        number: '040-123456',
        id: 3,
    },
    {
        name: 'Lea Kutvonen',
        number: '040-123456',
        id: 4,
    },
];

function generateId() {
    return Math.floor(Math.random() * Math.floor(100000));
}

function badRequest(res, errorText) {
    return res.status(400).json({ error: errorText });
}

function findPerson({ id, name, number }) {
    return persons.find(person => person.id === Number(id)
            || person.name === name
            || person.number === number);
}

const personsRouter = express.Router();

personsRouter.get('/', (req, res) => {
    res.json(persons);
});

personsRouter.get('/:id', ({ params: { id } }, res) => {
    const person = findPerson({ id });
    if (!person) res.status(404);
    res.json(person);
});

personsRouter.post('/', ({ body }, res) => {
    const person = body;

    if (!person.name) return badRequest(res, 'name is missing');
    if (!person.number) return badRequest(res, 'number is missing');
    if (findPerson({ name: person.name })) return badRequest(res, 'name must be unique');

    person.id = generateId();
    persons.push(person);
    return res.json(person);
});

personsRouter.delete('/:id', ({ params: { id } }, res) => {
    persons = persons.filter(person => person.id !== Number(id));
    res.status(204).end();
});

app.use('/api/persons', personsRouter);

app.get('/info', (req, res) => {
    const date = new Date().toISOString();
    const infoString = `Puhelinluottelossa on ${persons.length} henkilön tiedot.<br> ${date}`;
    res.send(infoString);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
