// Importación de módulos necesarios
const express = require('express');
const dotenv = require('dotenv');
const axios = require('axios');
const PostgresqlManager = require('../infraestructure/repository/PostgresqlRepository');
const [MovieHandler, MovieReviewHandler] = require('../domain/Movie');
const MovieApiRepository = require('../infraestructure/repository/MovieApiRepository')

// Carga de variables de entorno
dotenv.config();

// Creación de la aplicación Express
const app = express();

// Middleware para analizar JSON en solicitudes entrantes
app.use(express.json());

// Configuración del servidor y variables de entorno
const express_port = process.env.EXPRESS_SERVER_PORT || 8090;
const server_host = process.env.ENVIRONMENT === 'prod' ? process.env.PROD_SERVER_HOST : process.env.DEV_SERVER_HOST;
const movie_key = process.env.MOVIE_API_KEY;
const movie_token = process.env.MOVIE_API_TOKEN;

/* 
    Conexión a la base de datos PostgreSQL
*/
const db_manager = new PostgresqlManager({
    host: process.env.host,
    port: process.env.port,
    username: process.env.username,
    password: process.env.password,
    database: process.env.database
});
db_manager.connect();

// Instancia del repositorio de la API de películas
const movie_repository = new MovieApiRepository(movie_key, movie_token);

const movie_review_handler = new MovieReviewHandler(db_manager);

// Muestra la fecha y hora actual en el formato deseado
const currentDate = new Date();
const formattedDate = currentDate.toISOString().split('T')[0];


// Ruta GET para obtener información de una película por su ID de TMDB
app.get('/api/movies/:tmdbid', async (req, res) => {
    try {
        const movie_id = req.params.tmdbid;
        const movieFetch = new MovieHandler(db_manager, movie_id);
        const result = await movieFetch.getMovie();

        // Si la película existe en la base de datos, devuelve los detalles
        if (result.length) {
            console.log(`The movie ${result[0].title} exist in the database.`);
            res.status(200).send(result);
        } else {
            // Si no, informa que la película no se encuentra y sugiere hacer un POST
            console.log(`The movie ${movie_id} do not exist in the database.`);
            const result = {
                "id": movie_id,
                "message": "The movie has not been found in our server. Please, make a POST HTTP Request to: api/movies/tmdbid."
            };

            res.status(200).send(result);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error processing request');
    }
});

// Ruta POST para agregar una nueva película a la base de datos
app.post('/api/movies/:tmdbid', async (req, res) => {
    const movie_id = parseInt(req.params.tmdbid);
    const db_movie_data = await axios.get(`${server_host}:${express_port}/api/movies/${movie_id}`);

    // Verifica si la película ya existe en la base de datos
    if (db_movie_data.status != 200) {
        try {
            const movieHandler = new MovieHandler(db_manager, movie_id);
            const movie_data = await movie_repository.getMovieData(movie_id);
            const movie_database_data = [
                movie_data.data.id,
                movie_data.data.title,
                movie_data.data.release_date,
                movie_data.data.poster_path,
                movie_data.data.overview
            ];
            const result = await movieHandler.createMovie(movie_database_data);
            res.status(200).send(result);
        } catch (error) {
            console.error(error.message);
            res.status(500).send('Error processing request');
        }
    } else {
        // Si la película ya existe, informa al usuario
        const result = {
            "id": movie_id,
            "message": "The movie already exist in our server"
        };
        res.status(200).send(result);
    }
});

// Ruta GET para obtener todas las reseñas de una pelicula
app.get('/api/movies/:tmdbId/reviews', async (req, res) => {

    const movie_id = req.params.tmdbId;
    const db_movie_data = await axios.get(`${server_host}:${express_port}/api/movies/${movie_id}`);

    if (db_movie_data.status === 200) {
        try {

            const movie_reviews = await movie_review_handler.retrieveAllReviewsByMovie([movie_id]);   
            
            if (movie_reviews.length === 0) {
                const result = {
                    "id": movie_id,
                    "message": "The movie do not have reviews or do not exist in our Database."
                };

                res.status(200).send(result);

            } else {            
                res.status(200).send(movie_reviews);
            };            

        } catch (error) {
            console.error(error.message);
            res.status(500).send('Error processing request');        
        };
    } else {
        const result = {
            "id": movie_id,
            "message": "The movie has not been found in our server. Please, make a POST HTTP Request to: api/movies/tmdbid."
        }
        res.status(204).send(result);
    };
});


// Ruta para obtener la información de un usuario



// Ruta GET para obtener todas las reseñas de un usuario
app.get('/api/users/:userName/reviews',  async (req, res) => {

    const username = req.params.userName.replace('-',' ');    

    try {

        const username_movie_reviews = await movie_review_handler.retrieveAllReviewsByUser([username]);
        
        if (username_movie_reviews.length === 0) {

            const result = {
                "username": username,
                "message": "The username do not have reviews or do not exist in our Database."
            }

            res.status(200).send(result);

        } else {
            res.status(200).send(username_movie_reviews);
        }
                
    } catch (error) {

        console.error(error.message);
        res.status(500).send('Error processing request');        

    }
    
});


// Ruta POST para agregar una reseña de una película
app.post('/api/reviews', async (req, res) => {
    try {
        const movie_id = req.body.tmdbId;
        const username = req.body.userName;
        const rating = req.body.rating;

        console.log(formattedDate);

        const db_movie_data = await axios.get(`${server_host}:${express_port}/api/movies/${movie_id}`);

        if (db_movie_data.status === 200) {

            const review_values = [movie_id, formattedDate, username, rating];
            const result = await movie_review_handler.saveReview(review_values);

            res.status(200).send(result);

        } else {
            // Si no, informa que la película no se encuentra y sugiere hacer un POST
            console.log(`The movie ${movie_id} do not exist in the database.`);

            const result = {
                "id": movie_id,
                "message": "The movie has not been found in our server. Please, make a POST HTTP Request to: api/movies/tmdbid."
            };

            res.status(204).send(result);
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Error processing request');
    }
});

// Inicio del servidor Express
app.listen(express_port, () => {
    console.log(`The server has been initiated on port ${express_port}`);
});
