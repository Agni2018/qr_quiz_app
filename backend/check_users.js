const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/qr-quiz-platform').then(async () => {
    const users = await mongoose.connection.collection('users').find({
        _id: {
            $in: [
                new mongoose.Types.ObjectId('696f5560dfe655751f72e904'),
                new mongoose.Types.ObjectId('6982ed536d300cf027503dd7'),
                new mongoose.Types.ObjectId('6982f69ad1e7ed6a24aec4d2')
            ]
        }
    }).toArray();
    users.forEach(u => console.log(u._id, u.username, u.role));
    mongoose.disconnect();
}).catch(console.error);
