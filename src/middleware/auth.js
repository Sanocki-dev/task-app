const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Finds the user with the right id and the token still stored in the array
    const user = await User.findOne({ id: decoded.id, "tokens.token": token });

    if (!user) {
      throw new Error();
    }

    // Stores the user on the req so you dont have to get the user again
    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).send({ Error: "Please authenticate" });
  }
};

module.exports = auth;
