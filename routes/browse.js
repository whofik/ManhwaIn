const express = require('express');
const router = express.Router();
const scraper = require('../lib/ManhwaIndo');

async function renderListing(req, res, opts) {
    try {
        const page = parseInt(req.query.page) || 1;
        const data = await opts.fetch(page);
        res.render('listing', {
            heading: opts.heading,
            activeKey: opts.activeKey,
            results: data.results,
            pagination: data.pagination,
            baseUrl: opts.baseUrl
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Gagal memuat halaman.' });
    }
}

router.get('/popular', (req, res) => {
    renderListing(req, res, {
        heading: 'Manhwa Populer',
        activeKey: 'popular',
        baseUrl: '/popular',
        fetch: (p) => scraper.popular(p)
    });
});

router.get('/latest', (req, res) => {
    renderListing(req, res, {
        heading: 'Update Terbaru',
        activeKey: 'latest',
        baseUrl: '/latest',
        fetch: (p) => scraper.latest(p)
    });
});

router.get('/genre/:name', (req, res) => {
    const name = req.params.name;
    renderListing(req, res, {
        heading: 'Genre: ' + name.replace(/-/g, ' '),
        activeKey: '',
        baseUrl: `/genre/${name}`,
        fetch: (p) => scraper.genre(name, p)
    });
});

module.exports = router;