const mongoose = require('mongoose');

if (process.env.NODE_END !== 'production') {
    require('dotenv').config(); //eslint-disable-line
}

const url = process.env.MONGO_STRING;

console.log('URRLLL', url);

mongoose.connect(url);

const Person = mongoose.model('Person', {
    name: String,
    number: String,
    id: Number,
});

Person.format = person => ({
    name: person.name,
    number: person.number,
    id: person._id, //eslint-disable-line
});

module.exports = Person;
