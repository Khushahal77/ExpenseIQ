const router = require('express').Router();
const auth = require('../middleware/auth');
const { generatePDFReport } = require('../controllers/reportController');

router.use(auth);

router.get('/pdf', generatePDFReport);

module.exports = router;
