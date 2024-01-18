const axiosRepository = require('./axiosRepository');

const axios = new axiosRepository();

class MovieApiRepository {

    constructor(api_key, api_token) {
        this.key = api_key;
        this.token = api_token;
    }

    async getMovieData(movie_id) {
        
        const endpoint = `https://api.themoviedb.org/3/movie/${movie_id}?language=en-US`;
        const headers = {
            accept: 'application/json',
            Authorization: `Bearer ${this.token}`
        }

        const movie_data = await axios.getRequest(endpoint, headers);

        return movie_data;
    };
    
};


module.exports = MovieApiRepository;