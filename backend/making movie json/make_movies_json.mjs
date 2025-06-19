import fs from 'fs';
import fetch from 'node-fetch';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.TMDB_API_KEY;
const MOVIE_URL = 'https://api.themoviedb.org/3/movie/popular?language=en-US&page=';
const HEADERS = {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
};

async function getMovieNames(totalNeeded) {
    let names = [];
    let page = 1;
    while (names.length < totalNeeded) {
        const res = await fetch(MOVIE_URL + page, { headers: HEADERS });
        const data = await res.json();
        if (!data.results || data.results.length === 0) break;
        names.push(...data.results.map(m => m.title));
        page++;
        if (page > 50) break; // avoid too many requests
    }
    return names;
}

async function processCSV() {
    const rows = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream('./movies_large.csv')
            .pipe(csv())
            .on('data', (data) => rows.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    // Get enough random movie names from TMDB
    const movieNames = await getMovieNames(rows.length);

    // Shuffle movie names
    for (let i = movieNames.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [movieNames[i], movieNames[j]] = [movieNames[j], movieNames[i]];
    }

    // Build the JSON
    const results = {};
    rows.forEach((row, idx) => {
        const movie_id = row.movie_id;
        const genre = JSON.parse(row.genre.replace(/'/g, '"'));
        const name = movieNames[idx % movieNames.length]; // wrap if not enough names
        results[movie_id] = { name, genre };
    });

    fs.writeFileSync('movies_random_names.json', JSON.stringify(results, null, 2));
    console.log('movies_random_names.json created.');
}

processCSV();