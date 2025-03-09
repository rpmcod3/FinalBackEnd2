import { Schema, model } from "mongoose";

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, required: true },
  password: { type: String, required: true },
  cart: { type: Schema.Types.ObjectId, ref: "Carts" },
  role: { type: String, enum: ["admin", "user"], default: "user" },
});



  userSchema.pre("save", async function (next) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(this.email)) {
      return next();
    }
    next(new Error("Email no valido"));
  });
  


  export const userModel = model("user", userSchema);
