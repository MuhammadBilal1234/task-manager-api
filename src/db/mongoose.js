const mongoose = require("mongoose");

/*
     & 'C:\Program Files\MongoDB\Server\4.2\bin\mongod.exe' -dbpath C:\Users\hyperlink\Desktop\Misc\Mongodb-data
*/

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true
});
