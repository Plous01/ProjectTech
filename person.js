class Person {
    constructor(firstName, lastName) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.sports = [];
    }

    setAge(age) {
        this.age = age;
    }

    setGender(gender) {
        this.gender = gender;
    }

    addSport(sport){
        this.sports.push(sport);
    }
}

let persons = [];

persons[0] = new Person("Paulien","Lous");
persons[0].setAge(20);

persons[1] = new Person("Peter","Paul");
persons[1].setAge(25);

persons[2] = new Person("Casper","the Learner");
persons[2].setAge(16);

persons[3] = new Person("Herma","B");
persons[3].setAge(49);

function getPerson(id) {
    return persons[id];
}

function getPersons() {
    return persons;
}

function addPerson(person) {
    persons.push(person);
}


module.exports = { Person, getPerson, getPersons,addPerson };
