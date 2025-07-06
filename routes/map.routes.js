const express = require("express");
const router = express.Router();
const mapController  = require('../controllers/map.controller');
// const { query } = require("express-validator");
const { body, query } = require('express-validator');


/**
 * GET /get-coordinates?address=…
 * Returns latitude/longitude for the given address.
 */
// router.get(
//   '/get-coordinates',
//   query('address').isString().isLength({ min: 3 }),
//   mapController.getCoordinates
// );
router.post(
  '/get-coordinates',
  body('address').isString().isLength({ min: 3 }).trim(),
  mapController.getCoordinates
);

/**
 * GET /get-distance-time?origin=…&destination=…
 * Returns distance and travel time between two locations.
 */
router.get(
  '/get-distance-time',
  query('origin').isString().isLength({ min: 3 }),
  query('destination').isString().isLength({ min: 3 }),
  mapController.getDistanceTime
);

/**
 * GET /get-suggestions?input=…
 * Returns autocomplete suggestions for a partial address.
 */
router.get(
  '/get-suggestions',
  query('input').isString().isLength({ min: 3 }),
  mapController.getAutoCompleteSuggestions
);

module.exports = router;
