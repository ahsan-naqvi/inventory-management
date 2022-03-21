import mongoose from "mongoose";

const WarehouseSchema = mongoose.Schema({
    Barcode:  String,
    Quantity:  Number,
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

const WarehouseModel = mongoose.model('Warehouse', WarehouseSchema, 'Warehouse');

export default WarehouseModel;