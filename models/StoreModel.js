import mongoose from "mongoose";

const StoreSchema = mongoose.Schema({
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
    }
});

const StoreModel = mongoose.model('Store', StoreSchema, 'Store');

export default StoreModel;