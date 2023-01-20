const express = require("express");
const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const router = express.Router();

const isAuthenticated = require("../middlewares/isAuthenticated");
const convertToBase64 = require("../utils/convertToBase64");

const Offer = require("../models/Offer");

router.post(
  "/offer/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      //console.log("Je rentre dans ma route");
      // console.log(req.user);
      //console.log(req.body);
      //   console.log(req.files);
      const {title, description, price, condition, city, brand, size, color} =
        req.body;
      //const picture = req.files.picture;
      //const result = await cloudinary.uploader.upload(convertToBase64(picture));

      //console.log(result);
      const newOffer = new Offer({
        product_name: title,
        product_description: description,
        product_price: price,
        product_details: [
          {
            MARQUE: brand,
          },
          {
            TAILLE: size,
          },
          {
            ÉTAT: condition,
          },
          {
            COULEUR: color,
          },
          {
            EMPLACEMENT: city,
          },
        ],
        //product_image: result,
        owner: req.user,
      });

      //newOffer.product_image = result;

      await newOffer.save();
      //const response = await Offer.findById(newOffer._id).populate(
      // "owner",
      // "account"
      //);
      //   console.log(newOffer);
      //res.json(response);
      res.json(newOffer);
    } catch (error) {
      res.status(400).json({message: error.message});
    }
  }
);

router.get("/offers", async (req, res) => {
  try {
    const {title, priceMin, priceMax, page} = req.query;

    const filter = {};
    if (title) {
      filter.product_name = new RegExp(title, "i");
    }
    if (priceMin) {
      filter.product_price = {$gte: Number(priceMin)};
    }
    if (priceMax) {
      if (filter.product_price) {
        filter.product_price.$lte = Number(priceMax);
      } else {
        filter.product_price = {$lte: Number(priceMax)};
      }
    }

    const sortFilter = {};
    if (sort === "price-asc") {
      sortFilter.product_price = "asc";
    } else if (sort === "price-desc") {
      sortFilter.product_price = "desc";
    }
    const limit = 5;
    let pageRequired = 1;
    if (page) pageRequired = Number(page);

    const skip = (pageRequired - 1) * limit;

    const offers = await Offer.find(filter)
      .sort(sortFilter)
      .skip(skip)
      .limite(limit)
      .populate("owner", "account");
    //.select("produc_price", "account");

    const count = await Offer.countDocuments(filter);
    const response = {
      count: count,
      offers: offers,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({message: error.message});
  }

  // FIND

  //   const regExp = /chaussettes/i;
  //   const regExp = new RegExp("e", "i");
  //   const results = await Offer.find({ product_name: regExp }).select(
  //     "product_name product_price"
  //   );

  //   FIND AVEC FOURCHETTES DE PRIX
  //   $gte =  greater than or equal >=
  //   $lte = lower than or equal <=
  //   $lt = lower than <
  //   $gt = greater than >
  //   const results = await Offer.find({
  //     product_price: {
  //       $gte: 55,
  //       $lte: 200,
  //     },
  //   }).select("product_name product_price");

  //   SORT
  //   "asc" === "ascending" === 1
  //   "desc" === "descending" === -1
  //   const results = await Offer.find()
  //     .sort({ product_price: -1 })
  //     .select("product_name product_price");

  //   ON PEUT TOUT CHAINER
  // const results = await Offer.find({
  //   product_name: /vert/i,
  //   product_price: { $gte: 20, $lte: 200 },
  // })
  //   .sort({ product_price: -1 })
  //   .select("product_name product_price");

  //   SKIP ET LIMIT
  //   const results = await Offer.find()
  //     .skip(10)
  //     .limit(5)
  //     .select("product_name product_price");

  res.json(results);
});

router.get("/offer/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "account"
    );
    res.json(offer);
  } catch (error) {
    res.status(400).json({message: error.message});
  }
});

module.exports = router;
