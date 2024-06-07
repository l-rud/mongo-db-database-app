const express = require('express');
const router = express.Router();
//Importing the genres data from database file
const genres = require('../data/genres.js');

// BASE PATH
// - /api/genres

// Creating a GET route for the entire genres database
// This would be impractical in larger data sets(?)
// GET /api/genres
router.get('/', async (req, res) => {
  const links = [
    {
      href: 'genres/:id',
      rel: ':id',
      type: 'GET',
    },
  ];

  // Readning genres from genres collection of home_library_catalog MongoDB database
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
  const genresCollection = await db.collection('genres');
  const genres = await genresCollection.find().toArray();

  res.json({ genres, links });

  client.close();
});

// Creating a simple GET route for individual genres,
// using a route parameter for the unique id.
// GET /api/genres/:id
router.get('/:id', (req, res, next) => {
  const genre = genres.find((u) => u.id == req.params.id);

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

  if (genre) res.json({ genre, links });
  else next();
});

//Creating a genre (POST)
// POST /api/genres
router.post('/', (req, res) => {
  // Within the POST request route, we create a new
  // genre with the data given by the client
  if (req.body.name && req.body.description) {
    if (genres.find((u) => u.name == req.body.name)) {
      res.json({ error: 'Genre name already Taken' });
      return;
    }

    const genre = {
      id: genres[genres.length - 1].id + 1,
      name: req.body.name,
      description: req.body.description,
    };

    genres.push(genre);
    res.json(genres[genres.length - 1]);
  } else next(error(400, 'Insufficient Data'));
});

// PATCH /api/genres/:id
router.patch('/:id', (req, res) => {
  // Within the PATCH request route, we allow the client
  // to make changes to an existing genre in the database
  const genre = genres.find((u, i) => {
    if (u.id == req.params.id) {
      // iterating through the genre object and updating each property with the data that was sent by the client
      for (const key in req.body) {
        genres[i][key] = req.body[key];
      }
      return true;
    }
  });

  if (genre) res.json(genre);
  else next();
});

// DELETE /api/genres/:id
router.delete('/:id', (req, res) => {
  // The DELETE request route simply removes a resource
  const genre = genres.find((u, i) => {
    if (u.id == req.params.id) {
      genres.splice(i, 1);
      return true;
    }
  });

  if (genre) res.json(genre);
  else next();
});

module.exports = router;