const express = require('express');
const router = express.Router();
const scraper = require('../lib/ManhwaIndo');

router.get('/*', async (req, res) => {
    try {
        const path = req.path;

        if (path.includes('-chapter-')) {
            const data = await scraper.reader(path);
            return res.render('reader', {
                title: `${data.title} - ManhwaIn`,
                data: data
            });
        }

        const data = await scraper.detail('/series' + path);
        res.render('detail', {
            title: `${data.title} - ManhwaIn`,
            data: data
        });

    } catch (error) {
        console.error(error);
        res.render('error', { title: 'Error', message: 'Halaman tidak ditemukan atau gagal dimuat.' });
    }
});

module.exports = router;
