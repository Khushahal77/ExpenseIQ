const router = require('express').Router();
const auth = require('../middleware/auth');
const { generateInsights } = require('../controllers/aiInsightsController');

router.use(auth);

router.post('/generate', generateInsights);

module.exports = router;
