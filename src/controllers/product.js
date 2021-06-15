// Models
const Product = require("../models/product");

// Modules
const fs = require("fs");

// Third Party Modules
const formidable = require("formidable");
const _ = require("lodash");

// Params Methods
exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, pro) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found in DB",
        });
      }

      req.product = pro;
      next();
    });
};

// Middlewares for grabbing photo. Used in (createProduct, updateProduct)
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

// Middleware for Stock management
exports.updateStock = (req, res, next) => {
  let myOperations = req.body.order.products.map((prod) => {
    return {
      updateOne: {
        filter: { _id: prod._id },
        update: { $inc: { stock: -prod.count, sold: +prod.count } },
      },
    };
  });

  Product.bulkWrite(myOperations, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "BULK operations failed",
      });
    }
    next();
  });
};

// Routes Methods
exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with Image",
      });
    }

    // Destructure the fields
    const { name, description, price, category, stock } = fields;

    // Restrictions on field
    if (!name || !description || !price || !price || !category || !stock) {
      return res.status(400).json({
        error: "Please include all fields",
      });
    }

    let product = new Product(fields);

    // Handle Files Here
    if (files.photo) {
      if (files.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    // Save to the DB
    product.save((err, pro) => {
      if (err) {
        return res.status(400).json({
          error: "Saving product in DB failed",
        });
      }

      res.json(pro);
    });
  });
};

exports.getSingleProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

exports.deleteProduct = (req, res) => {
  let product = req.product;

  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "Failed to delete product",
      });
    }

    res.json({
      message: "Deletion was a success",
      deletedProduct,
    });
  });
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(400).json({
        error: "Problem with Image",
      });
    }

    // Updation Code
    let product = req.product;
    product = _.extend(product, fields);

    // Handle Files Here
    if (files.photo) {
      if (files.photo.size > 3000000) {
        return res.status(400).json({
          error: "File size too big!",
        });
      }

      product.photo.data = fs.readFileSync(files.photo.path);
      product.photo.contentType = files.photo.type;
    }

    // Save to the DB
    product.save((err, pro) => {
      if (err) {
        return res.status(400).json({
          error: "Updation of product failed",
        });
      }

      res.json(pro);
    });
  });
};

// Listing Products
exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8;
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "No product Found",
        });
      }

      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(400).json({
        error: "NO category found",
      });
    }

    res.json(category);
  });
};
