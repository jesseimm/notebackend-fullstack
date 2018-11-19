const mongoose = require('mongoose');

const url = require('./connection.js').databaseConnection;

mongoose.connect(url);

const name = process.argv[2];
const number = process.argv[3];

console.log('####################3', name, number);

const Person = mongoose.model('Person', {
    name: String,
    number: String,
});

if (name && number) {
    const person = new Person({
        name,
        number,
    });

    person
        .save()
        .then((response) => {
            console.log('person saved!');
            console.log('resp', response);
            mongoose.connection.close();
        });
} else {
    Person
        .find({})
        .then((result) => {
            result.forEach((person) => {
                console.log(person);
            });
            mongoose.connection.close();
        });
}
