import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import UserModel from "../services/users/schema";
import { generateJWT } from "./tools";

const googleStrategy = new GoogleStrategy.Strategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    callbackURL: process.env.GOOGLE_CALLBACK,
  },
  async (accessToken, refreshToken, profile, passportNext) => {
    console.log(profile);
    // check if the user is in the database
    const user = await UserModel.findOne({ googleId: profile.id });
    console.log("User in databse:", user);
    // if the user in exist, then generate the token
    if (user) {
      const token = await generateJWT({ _id: user._id.toString() });

      console.log(user._id);
      passportNext(null, { token });
    } else {
      const newUser = new UserModel({
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        email: profile.emails?.[0].value,
        image: profile.photos?.[0].value,
        googleId: profile.id,
      });
      await newUser.save();
      console.log("New User:", newUser);
      const token = await generateJWT({ id: newUser._id.toString() });

      passportNext(null, { token });
    }
  }
);

passport.serializeUser(function (userData, passportNext) {
  passportNext(null, userData);
});

export default googleStrategy;
