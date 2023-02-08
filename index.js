
const { db } = require("./firebase");

const express = require('express');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

const miminumRating = 3.5

const Collections = {
  USERS: 'users',
  ARTISTS: 'artists',
  ALBUMS: 'albums'
}

app.use(express.json());
app.use(cors({
  origin: '*'
}));


/**ALBUMS */

const base_url = "https://music-service-yod6.onrender.com"

app.post('/rateAlbum', async (req, res) => {
  const { id, rate } = req.body;
  console.log('body: ', req.body);
  let album = null;
  if (!id) {
    return res.status(400).send('Se debe enviar un id');
  }

  const albumRef = db.collection(Collections.ALBUMS).doc(id);
  const docSnap = await albumRef.get();
  if (docSnap.exists) {
    album = docSnap.data();
    console.log('document: ', album);
  } else {
    console.log('No such document!');
  }

  const votes_t = album.votes + 1
  const newRating = (album.ratingSum + parseInt(rate)) / (votes_t);
  
  const result = await albumRef.update({
    votes:votes_t,
    ratingSum: album.ratingSum + parseInt(rate),
    rating: newRating
  });
  return res.status(200).json(result);
});




//return res.status(200).json(suggestions)
app.post('/getSuggestions', async (req, res) => {
  try {
    const preferences = req.body.preferences;
    console.log(JSON.stringify(preferences))
    let suggestions = []
    if (!preferences) {
      return res.status(400).send("Se debe enviar un preferencias")
    }

    const response = await fetch(`${base_url}/albums`)
    const albums = await response.json()

    for (let i = 0; i < albums.length; i++) {
      const album = albums[i]
      if (matchGenre(album, preferences) && album.rating > miminumRating) {
        const artistRes = await fetch(`${base_url}/artistByName?name=${album.artist}`)
        const artist = await artistRes.json()
        if (artist.genre === album.genre) {
          album.rating += 1
        }
        suggestions.push(album)
      }
    }
    suggestions = sortByRating(suggestions)
    return res.status(200).json(suggestions);
  } catch (error) {
    return res.status(400).json({ msg: error.message });
  }
});


function matchGenre(album, preferences) {
  for (const genre of preferences) {
    if (genre === album.genre) {
      return true
    }
  }
  return false
}

function sortByRating(albums) {
  // Recorre cada elemento
  for (let i = 1; i < albums.length; i++) {
    // Almacena el elemento actual en una variable
    let current = albums[i];
    // Inicializa j como i - 1
    let j = i - 1;
    // Mientras j sea mayor o igual a 0 y el elemento en la posición j tenga un rating mayor que el elemento actual
    while (j >= 0 && albums[j].rating < current.rating) {
      // Desplaza el elemento en la posición j al siguiente lugar
      albums[j + 1] = albums[j];
      // Decrementa j en 1
      j--;
    }
    // Coloca el elemento actual en la posición correcta
    albums[j + 1] = current;
  }
  // Devuelve la matriz ordenada
  return albums;
}



app.listen(port, () => {
  console.log(`Servidor en el puerto ${port}`);
});
