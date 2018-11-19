const mongoose = require('mongoose');

const url = process.env.MONGO_STRING;

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
