const express = require('express')
const Result = require('../models/Result')

const router = express.Router()

router.get('/notice', function(req, res) {
    console.log('notice');
  })

module.exports = router