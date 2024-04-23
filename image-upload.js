const multer = require('multer');
const path = require('path');

// to do: hyväksy vain filet jotka kuvia .jpg, .png  mitä näitä on ????
const storage = multer.diskStorage({
    destination: './public/upload-images/',
    filename: function(req, file, cb){
      cb(null, file.originalname);
    }
});

const upload = multer({
    storage: storage,
    //5mb filen koko ??? onkohan ok
    limits:{fileSize: 5000000},
}).single('myImage');

module.exports = upload;