import mongoose from "mongoose";

const UserSchema = mongoose.Schema({
    Username:  String,
    Password:  String,
    Status:  String,
    Role:  String,
    CreatedBy: String,
    CreatedOn: {
        type: Date,
        default: new Date()
    },
    UpdatedBy: String,
    UpdatedOn: {
        type: Date,
        default: new Date()
    }
});

const UserModel = mongoose.model('User', UserSchema);

export default UserModel;