const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/qr-quiz-platform').then(async () => {
    const attempts = await mongoose.connection.collection('userattempts').find({
        'user.name': { $regex: /rahul/i }
    }).toArray();

    console.log("=== RAHUL ATTEMPTS ===");
    attempts.forEach(a => console.log('Quiz Name:', a.user.name, '| Real DB userId attached to this attempt:', a.userId));

    const maxAttempts = await mongoose.connection.collection('userattempts').find({
        'user.name': { $regex: /max/i }
    }).toArray();

    console.log("\n=== MAX ATTEMPTS ===");
    maxAttempts.forEach(a => console.log('Quiz Name:', a.user.name, '| Real DB userId attached to this attempt:', a.userId));

    mongoose.disconnect();
}).catch(console.error);
