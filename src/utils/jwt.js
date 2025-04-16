// Import the jsonwebtoken library
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

// Define a function that generates a JWT and sets it as a cookie
export const generateTokenAndSetCookie = (userId, res) => {
  // Use the jsonwebtoken library to sign a JWT with the user ID and a secret key
  // Set the expiration time of the token to 15 days
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 1000, //MS
    httpOnly: true, // prevent XSS attacks cross-site scripting attacks
    sameSite: "strict", // CSRF attacks cross-site request forgery attacks
    secure: process.env.NODE_ENV !== "development",
  });
  return token;
};