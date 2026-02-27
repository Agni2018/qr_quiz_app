const fs = require('fs'); const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/qr-quiz-platform').then(async () => {
    const attempts = await mongoose.connection.collection('userattempts').find({
        userId: new mongoose.Types.ObjectId('696f5560dfe655751f72e904')
    }).toArray();
    fs.writeFileSync('attempts_dump.json', JSON.stringify(attempts.map(a => ({ _id: a._id, name: a.user.name, email: a.user.email, phone: a.user.phone })), null, 2));
    mongoose.disconnect();
}).catch(console.error);
