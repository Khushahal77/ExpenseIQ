const router = require('express').Router();
const auth = require('../middleware/auth');
const { getSummary, getCategoryBreakdown, getMonthlyTrend } = require('../controllers/analyticsController');

router.use(auth);

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/monthly', getMonthlyTrend);

module.exports = router;
