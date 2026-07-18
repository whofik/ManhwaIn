const express = require('express');
const router = express.Router();
const scraper = require('../lib/ManhwaIndo');

router.get('/', async (req, res) => {
    try {
        const data = await scraper.home();
        res.render('index', { 
            title: 'ManhwaIn - Tempat Baca Manhwa Terlengkap', 
            popular: data.popular,
            latest: data.latest
        });
    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Gagal memuat beranda.' });
    }
});

module.exports = router;