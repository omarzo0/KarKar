const express = require('express');
const router = express.Router();

// Minimal analytics routes placeholder
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Analytics endpoint placeholder' });
});

module.exports = router;
