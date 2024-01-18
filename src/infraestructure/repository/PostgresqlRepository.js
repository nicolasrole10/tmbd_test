const pg = require('pg');

class PostgresqlManager {
    constructor(host, port, username, password, database) {
        this.host = host;
        this.port = port;
        this.username = username;
        this.password = password;
        this.database = database;
        this.pool = null;
    }

    async connect() {
        const pool = new pg.Pool({
            host: "localhost", //this.host,
            port: 5432, //this.port,
            username: "nicolion", //this.username,
            password: "m1598523", //this.password,
            database: "moviedb", //this.database
        });

        this.pool = pool;
    }

    async create(query, parameters) {
        const results = await this.pool.query(query, parameters);
        return results;
    }

    async read(query, parameters) {
        const results = await this.pool.query(query, parameters);
        return results.rows;
    }


}

module.exports = PostgresqlManager;