CREATE DATABASE IF NOT EXISTS moviedb;

CREATE TABLE IF NOT EXISTS movie (
    id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    release_date DATE NOT NULL,
    poster TEXT,
    overview TEXT
);

CREATE TABLE IF NOT EXISTS movie_review (
    id SERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    created_at DATE NOT NULL,
    username VARCHAR,
    rating INTEGER,
    CONSTRAINT fk_movie FOREIGN KEY(movie_id) REFERENCES movie(id)
);



INSERT INTO movie (id, title, release_date, poster, overview)
VALUES (2646, 'Aces Go Places III: Our Man from Bond Street', '1984-01-25', '/suYE32h1GsqmZhCPVhJuFxUgy7Q.jpg', 'A master thief is duped by lookalikes for James Bond and the Queen of England into stealing a valuable gem from a heavily guarded location then must help the police recover it.');
