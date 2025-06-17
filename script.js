const Locker = require('./entity/locker');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/lockless', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

Locker.syncIndexes()
    .then(() => console.log('Indexes mis à jour'))
    .catch(err => console.error(err));