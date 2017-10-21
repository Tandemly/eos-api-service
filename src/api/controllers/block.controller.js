const httpStatus = require("http-status");
const { omit } = require("lodash");
const aqp = require("api-query-params");
const Block = require("../models/block.model");
const { handler: errorHandler } = require("../middlewares/error");

/**
 * Load EOS Block and append to req.
 * @public
 */
exports.load = async (req, res, next, block_ident) => {
  try {
    const block = await Block.get(block_ident);
    req.locals = { block };
    return next();
  } catch (error) {
    return errorHandler(error, req, res);
  }
};

/**
 * Get EOS Block
 * @public
 */
exports.get = (req, res) => res.json(req.locals.block);

/**
 * Get Block list
 * @public
 */
exports.list = async (req, res, next) => {
  try {
    const query = aqp(req.query);
    const blocks = await Block.list(query);
    res.json(blocks);
  } catch (error) {
    next(error);
  }
};
