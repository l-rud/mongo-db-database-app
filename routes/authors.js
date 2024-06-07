const express = require('express');
const router = express.Router();
//Importing the authors data from database file
const authors = require('../data/authors.js');

// BASE PATH
// - /api/authors

// Creating a GET route for the entire authors database
// This would be impractical in larger data sets(?)
// GET /api/authors
router.get('/', async (req, res) => {
  const links = [
    {
      href: 'authors/:id',
      rel: ':id',
      type: 'GET',
    },
  ];

  // Readning authors from authors collection of home_library_catalog MongoDB database
  const MongoClient = require('mongodb').MongoClient;
  const dotenv = require('dotenv');
  dotenv.config();
  
  // Variable for storing the connection string from our .env file
  const connectionString = process.env.ATLAS_URI || '8000';
  // Creating a new instance of the MongoClient
  const client = new MongoClient(connectionString);
  
  let conn;
  try {
    // Connecting to your cluster
    conn = await client.connect();
    console.log('Successfully connected to Mongo!');
  } catch (e) {
    console.log(e);
  }
  
  const db = conn.db('home_library_catalog');
  const authorsCollection = await db.collection('authors');
  const authors = await authorsCollection.find().toArray();

  res.json({ authors, links });

  client.close();
});

// Creating a simple GET route for individual authors,
// using a route parameter for the unique id.
// GET /api/authors/:id
router.get('/:id', (req, res, next) => {
  const author = authors.find((u) => u.id == req.params.id);

  const links = [
    {
      href: `/${req.params.id}`,
      rel: '',
      type: 'PATCH',
    },
    {
      href: `/${req.params.id}`,
      rel: '',
      type: 'DELETE',
    },
  ];

  if (author) res.json({ author, links });
  else next();
});

//Creating a author (POST)
// POST /api/authors
router.post('/', async (req, res) => {
  // Within the POST request route, we create a new
  // author with the data given by the client
  if (req.body.name && req.body.genreId) {
    if (authors.find((u) => u.name == req.body.name)) {
      res.json({ error: 'Author name already Taken' });
      return;
    }

    const author = {
      id: authors[authors.length - 1].id + 1,
      name: req.body.name,
      description: req.body.description,
    };

    // authors.push(author);
    // res.json(authors[authors.length - 1]);

    // Readning authors from authors collection of home_library_catalog MongoDB database
    const MongoClient = require('mongodb').MongoClient;
    const dotenv = require('dotenv');
    dotenv.config();
  
    // Variable for storing the connection string from our .env file
    const connectionString = process.env.ATLAS_URI || '8000';
    // Creating a new instance of the MongoClient
    const client = new MongoClient(connectionString);
  
    let conn;
    try {
      // Connecting to your cluster
      conn = await client.connect();
      console.log('Successfully connected to Mongo!');
    } catch (e) {
      console.log(e);
    }
  
    const db = conn.db('home_library_catalog');
    const authorsCollection = await db.collection('authors');
    
    const newDocument = req.body;
    const result = await authorsCollection.insertOne(newDocument);
    res.json(result).status(204);

    client.close();

  } else next(error(400, 'Insufficient Data'));
});

// PATCH /api/authors/:id
router.patch('/:id', (req, res) => {
  // Within the PATCH request route, we allow the client
  // to make changes to an existing author in the database
  const author = authors.find((u, i) => {
    if (u.id == req.params.id) {
      // iterating through the author object and updating each property with the data that was sent by the client
      for (const key in req.body) {
        authors[i][key] = req.body[key];
      }
      return true;
    }
  });

  if (author) res.json(author);
  else next();
});

// DELETE /api/authors/:id
router.delete('/:id', (req, res) => {
  // The DELETE request route simply removes a resource
  const author = authors.find((u, i) => {
    if (u.id == req.params.id) {
      authors.splice(i, 1);
      return true;
    }
  });

  if (author) res.json(author);
  else next();
});

module.exports = router;