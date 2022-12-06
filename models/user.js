
import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
  emailId: {
    type: String,
    required: true,
    unique: true,
    min: 5,
    max: 255,
  },
  password: {
    type: String,
    required: true,
  },
  Role : {
    type : String
  },
  phone : {
    type : String
  },
  isVerified : {
    type : Boolean,
    default : false
  },
  verify_code : {
    type : String,
    default : null,
  }
});

const User = mongoose.model("User", userSchema);

export default User;
