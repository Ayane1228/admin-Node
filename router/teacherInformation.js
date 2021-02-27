const express = require('express')
const Result = require('../models/Result')
const { findAdmin } = require('../service/teacherI.js')
const router = express.Router()


router.get('/teacherInformation', function (req,res) {
    if (req.user.username == 'admin') {
        findAdmin
    } else {
        console.log(req);
    }
})

module.exports = router