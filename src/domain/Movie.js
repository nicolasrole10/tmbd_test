class MovieHandler {

    constructor(engine, id) {
        this.engine = engine;
        this.movie_id = parseInt(id);
        this.movie_table = 'movie';
    }

    async getMovie() {
        const get_movie_query = "SELECT * FROM movie WHERE id=$1;";
        const result = await this.engine.read(get_movie_query, [this.movie_id]);
        return result;
    }

    async createMovie(values) {
        
        const query = "INSERT INTO movie (id, title, release_date, poster, overview) VALUES ($1,$2,$3,$4,$5);"        
        const result = await this.engine.create(query, values);
        return result;
    }
}


class MovieReviewHandler {

    constructor(engine) {
        this.engine = engine;
    }

    async saveReview(values) {
        const query = "INSERT INTO movie_review (movie_id, created_at, username, rating) VALUES($1,$2,$3,$4)";                
        const result = await this.engine.create(query, values);
        return result
    };

    async retrieveAllReviewsByMovie(values) {
        const query = "SELECT * FROM movie_review WHERE movie_id=$1"
        const result = await this.engine.read(query, values);
        return result    
    };

    async retrieveAllReviewsByUser(values) {
        const query = "SELECT * FROM movie_review WHERE username=$1"
        const result = await this.engine.read(query, values);
        return result;
    };

}

module.exports = [MovieHandler, MovieReviewHandler];