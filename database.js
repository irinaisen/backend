const { default: mongoose } = require('mongoose');

require('dotenv').config();

const dbURI = 'mongodb+srv://'+process.env.DBUSERNAME+':'+process.env.DBPASSWORD+'@'+process.env.CLUSTER+'.mongodb.net/'+process.env.DB+'?retryWrites=true&w=majority&appName=Cluster0'

mongoose.connect(dbURI)
.then((result) => {

    console.log("Connected to DB");
})
.catch((error)=>{
    console.log(error)
})


