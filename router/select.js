const express = require('express')
const Result = require('../models/Result')

const router = express.Router()

const { findSelect } = require('../service/Select')