const express = require('express');
const router = express.Router();
const scraper = require('../lib/ManhwaIndo');

router.get('/', async (req, res) => {
    try {
        let query = (req.query.q || '').toString().trim().replace(/\s+/g, ' ');
        const page = parseInt(req.query.page) || 1;

        if (!query) {
            return res.redirect('/');
        }

        const data = await scraper.search(query, page);
        res.render('search', {
            title: `Pencarian: ${query} - ManhwaIn`,
            query: query,
            results: data.results,
            pagination: data.pagination
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Gagal melakukan pencarian.' });
    }
});

module.exports = router;