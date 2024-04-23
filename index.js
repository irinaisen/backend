if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const express = require('express');
const exphbs = require('express-handlebars');
const app = express();
const port = 3000;
const imageUpload = require('./image-upload');
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')



//with this middleware we can get the data from HTML form
app.use(express.urlencoded({ extended: false }));

app.engine(
  'handlebars',
  exphbs.engine({
    defaultLayout: 'main' /*,     //vähän epäturvallisempi tapa tehdä tämä
    runtimeOptions: {
        allowProtoPropertiesByDefault: true,
        allowProtoMethodsByDefault: true
    } */,
  })
);

app.set('view engine', 'handlebars');








const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
  res.render('./', { name: req.user.name })
})

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
})



app.post('./logout', (req, res) => {
  req.logOut()
  res.redirect('/login')
})



function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}











require('./database.js');
const Blogpost = require('./models/Blogpost');

/*
const newBlogpost = new Blogpost({
  title: 'Testi blogipostaus',
  author: 'Testi ',
  body: 'asdasdasdabdsbsabdsab basd bsa dbdsba bsadb bdsab sabads badsb bdsaasbd ',
  comments: [{
    body: 'Great post!',
    date: new Date()
  }],
  date: new Date(),
});

newBlogpost.save()
.then((result)=>{
  console.log(result);
})
.catch((error)=>{
  console.log(error);
}) */

app.get('/', (req, res) => {
  res.render('./');
});

app.get('/add-post', (req, res) => {
  res.render('./add-post');
});

app.get('/contact', (req, res) => {
  res.render('./contact');
});


app.get('/sign-in', (req, res) => {
  res.render('./sign-in');
});

app.get('/login', (req, res) => {
  res.render('./login');
});



//Folder for static files like css, jpg...
app.use(express.static('public'));

//Create blogposts webpage and list all the resources
//API
app.get('/blogposts', async (req, res) => {
  try {
    const blogposts = await Blogpost.find();
    // res.json(result);
    res.render('blogposts', {
      title: 'Blogipostaukset',
      blogposts: blogposts.map((doc) => doc.toJSON()),
    });
  } catch (error) {
    res.status(404),
      render('blogposts', {
        title: 'We got an error here',
      });
    console.log(error);
  }
});

app.get('/blogposts/search', async (req, res) => {
  try {
    const match = new RegExp(req.query.searchFilter, 'i');
    const blogposts = await Blogpost.find({ title: match });
    // res.json(result);
    res.render('blogposts', {
      title: 'Blogipostaukset',
      blogposts: blogposts.map((doc) => doc.toJSON()),
    });
  } catch (error) {
    res.status(404),
      render('blogposts', {
        title: 'We got an error here',
      });
    console.log(error);
  }
});


app.get('/blogposts/:radio', async (req,res) => {
  
  const id = req.params.id;
  const postContinent = await Blogpost.findById(id);
  res.json(postContinent);
});



app.get('/blogposts/delete', async (req, res) => {
  try {
    const match = req.query.id;
    const result = await Blogpost.deleteOne ({ _id: match });
    // res.json(result);
    res.redirect('/blogposts');
  } catch (error) {
    res.status(404),
      render('blogposts', {
        title: 'We got an error here',
      });
    res.render('blogposts');
  }
});

app.delete('/blogposts', async (req, res) => {
  const { id } = req.params;

  try {
    const blogs = await Blogpost.findByIdAndDelete(id);
    res.send(blogs);
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

//Create a document to mongodb. add to mongodb, submit data from web form

//route for form page


//-----------------BLOGIPOSTAUS FORMDATA STARTTI---------------------------------------------------------------
// Muunneltu blogposts
app.post('/blogposts', imageUpload, async (req, res) => {
  const imageUrl = req.file ? `/upload-images/${req.file.filename}` : null; 
  const newBlogpost = new Blogpost({
    ...req.body,
    image: imageUrl //imagen url
  });

  try {
    await newBlogpost.save();
    res.send('Blogipostaus ja kuva lisätty.');
  } catch (error) {
    console.error(error);
    res.status(500).send('Virhe tallennettaessa blogipostausta ja kuvaa.');
  }
});

//-----------------BLOGIPOSTAUS FORMDATA END---------------------------------------------------------------
// KOMMENTTI ENDPOINT. 
app.post('/comments/:id', async (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  try {
    
    const post = await Blogpost.findById(id);

    // Pushilla arrayhin
    post.comments.push({
      body,
      date: Date.now()
    });

    
    await post.save();

    res.status(200).json({ message: 'kommentti lisätty tietokantaan' });
  } catch (err) {
    res.status(500).json({ message: 'error kommenttia ei saatu lisättyä tietokantaan.', error: err.toString() });
  }
});

// KOMMENTTI ENDPOINT. 

/*  HAE POSTAUKSEN NIMELLÄ
app.get('/blogposts/:id', async (req,res) => {
  const id = req.params.id;
  const blogpost = await Blogpost.findById(id);
  res.json(blogpost);
});
*/

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

/*

const getAll = async () => {
    try
    {
        const result = await Product.find();
        console.log(result);
    }
    catch
    {
        console.log(error);
    }
}
*/

//deleting a product ajax
//delete, update resource projektissa



