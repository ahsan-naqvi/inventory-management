import mongoose from "mongoose";

const Warehouse_hSchema = mongoose.Schema({
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
    },
    PostedBy: String,
    PostedOn: {
        type: Date,
        default: new Date()
    }
});

const Warehouse_hModel = mongoose.model('Warehouse_h', Warehouse_hSchema, 'Warehouse_h');

export default Warehouse_hModel;