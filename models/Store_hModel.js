import mongoose from "mongoose";

const Store_hSchema = mongoose.Schema({
    ProductName:  String,
    Barcode:  String,
    Quantity:  Number,
    Classification:  String,
    CreatedBy: String,
    CreatedOn: {
        type: Date,
        default: new Date()
    },
    UpdatedBy: String,
    UpdatedOn: {
        type: Date,
        default: new Date()
    },
    PostedBy: String,
    PostedOn: {
        type: Date,
        default: new Date()
    }
});

const Store_hModel = mongoose.model('Store_h', Store_hSchema, 'Store_h');

export default Store_hModel;