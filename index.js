require('dotenv').config()
const express = require('express')
const path = require('path')
const fs = require('fs')

const homeRoute = require('./routes/home');
const searchRoute = require('./routes/search');
const browseRoute = require('./routes/browse');
const detailRoute = require('./routes/detail');

const app = express()
const port = process.env.PORT || 3001

function resolveDir(rel) {
    const candidates = [
        path.join(process.cwd(), rel),
        path.join(__dirname, rel),
        path.join(__dirname, '..', rel),
        path.join(__dirname, '..', '..', rel)
    ]
    for (const c of candidates) {
        if (fs.existsSync(c)) return c
    }
    return candidates[0]
}

app.use(express.static(resolveDir('public')))
app.set('view engine', 'ejs')
app.set('views', resolveDir('views'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use('/', homeRoute);
app.use('/search', searchRoute);
app.use('/', browseRoute);
app.use('/series', detailRoute);
app.use((req, res, next) => {
    if (req.path.includes('-chapter-')) {
        return detailRoute(req, res, next);
    }
    next();
});

app.use((req, res) => {
    res.status(404).render('404', { title: '404 - Tidak Ditemukan' });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`ManhwaIn running at http://localhost:${port}`)
    })
}

module.exports = app
