const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const Person = require('./models/person');

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => { // cors package could also be used
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

morgan.token('body', req => JSON.stringify(req.body));
const loggerFormat = ':method :url :body :status :response-time';

app.use(morgan(loggerFormat, {
    stream: process.stdout,
}));

app.use(express.static('build'));

function badRequest(res, errorText) {
    return res.status(400).json({ error: errorText });
}

const personsRouter = express.Router();

personsRouter.get('/', (req, res) => {
    Person
        .find({}, { __v: 0 })
        .then((people) => {
            res.json(people.map(Person.format));
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
});

personsRouter.get('/:id', ({ params: { id } }, res) => Person
    .findById(id)
    .then((person) => {
        res.json(Person.format(person));
    })
    .catch((err) => {
        console.log(err);
        res.status(404).end();
    }));

personsRouter.post('/', ({ body }, res) => {
    if (!body.name) return badRequest(res, 'name is missing');
    if (!body.number) return badRequest(res, 'number is missing');

    const person = new Person({
        name: body.name,
        number: body.number,
    });

    return Person
        .findOne({ name: body.name }, { __v: 0 })
        .then((existingPerson) => {
            if (existingPerson) throw new Error('name must be unique');
            else return person.save();
        })
        .then((savedPerson) => {
            res.json(Person.format(savedPerson));
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
});

personsRouter.put('/:id', ({ body, params }, res) => {
    if (!body.name) return badRequest(res, 'name is missing');
    if (!body.number) return badRequest(res, 'number is missing');

    const person = {
        name: body.name,
        number: body.number,
    };

    console.log('params.id', params.id);

    return Person
        .findByIdAndUpdate(params.id, person, { new: true })
        .then((updatedPerson) => {
            res.json(Person.format(updatedPerson));
        })
        .catch((err) => {
            console.log(err);
            res.status(400).send({ error: 'malformatted id' });
        });
});

personsRouter.delete('/:id', ({ params: { id } }, res) => {
    Person
        .findByIdAndRemove(id)
        .then(() => {
            res.status(204).end();
        })
        .catch((err) => {
            console.log(err);
            res.status(204).end();
        });
});

app.use('/api/persons', personsRouter);

app.get('/info', (req, res) => {
    Person
        .find({}, { __v: 0 })
        .then((people) => {
            const date = new Date().toISOString();

            const infoString = `Puhelinluottelossa on ${people.length} henkilön tiedot.<br> ${date}`;
            res.send(infoString);
        })
        .catch((err) => {
            console.log(err);
            res.status(500).end();
        });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
