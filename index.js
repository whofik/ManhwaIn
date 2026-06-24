require('dotenv').config()
const express = require('express')
const path = require('path')
const Mobinime = require('./lib/ServerData')
const setupRoutes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const mobinime = new Mobinime()

app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

setupRoutes(app, mobinime)

if (require.main === module) {
    app.listen(port, () => {
        console.log(`WibuKon running at http://localhost:${port}`)
    })
}

module.exports = app
