import WarehouseModel from "../models/WarehouseModel.js";
import StoreModel from "../models/StoreModel.js";
import Store_hModel from "../models/Store_hModel.js";
import Warehouse_hModel from "../models/Warehouse_hModel.js";
import csv from "csv-parser" ;
import fs from "fs" ;

// #region Get Actions

export const FindAllProducts = async (req,res) =>{
    try {
        const { columnName, sortDirection, columnType } = req.query;
        const StoreList = await StoreModel.find().sort('Barcode').skip(0).limit(10);
        const WarehouseList = await WarehouseModel.find({ Barcode: { $in: StoreList.map((x) => x.Barcode) }}).sort('Barcode');//.skip(0).limit(10);
        
        const TotalRecord = await StoreModel.count();
        
        let ProductList = PrepareClientProductList(WarehouseList, StoreList);    
        SortProductList(columnType, ProductList, columnName, sortDirection);
        console.log('prod: ', ProductList);
        res.status(200).json({ProductList, TotalRecord});

    } catch (error) {
        res.status(404).json({message: error.message });
    }
}

export const FindProductsByBarcode = async (req,res) => {
    try {
        const { searchText } = req.query;
        const StoreFilteredList = await StoreModel.find({Barcode: new RegExp('.*'+searchText+'.*')}).sort('Barcode');        
        const WarehouseFilteredList = await WarehouseModel.find({ Barcode: { $in: StoreFilteredList.map((x) => x.Barcode) }}).sort('Barcode');

        let ProductFilteredList = PrepareClientProductList(WarehouseFilteredList, StoreFilteredList);  
        
        res.status(200).json({ProductList: ProductFilteredList});

    } catch (error) {
        res.status(404).json({message: error.message });
        
    }
}


export const GetSortedProductsData = async (req,res) => {
    try {
        const { columnName, sortDirection, columnType } = req.query;
        
        const StoreFilteredList = await StoreModel.find();//.skip(0).limit(10);
        const WarehouseFilteredList = await WarehouseModel.find({ Barcode: { $in: StoreFilteredList.map((x) => x.Barcode) }});

        let ProductFilteredList = PrepareClientProductList(WarehouseFilteredList, StoreFilteredList);  
        await SortProductList(columnType, ProductFilteredList, columnName, sortDirection);
        ProductFilteredList = ProductFilteredList.slice(0,10);
        
        res.status(200).json({ProductList: ProductFilteredList});

    } catch (error) {
        res.status(404).json({message: error.message });
        
    }
}

export const ChangePage = async (req,res) => {
    try {
        const { columnName, sortDirection, columnType, page, size } = req.query;
        const limit = parseInt(size);
        const skip = (parseInt(page) - 1) * limit;
        console.log(page,limit,skip)
        const StoreFilteredList = await StoreModel.find().sort('Barcode');//.skip(skip).limit(limit);        
        const WarehouseFilteredList = await WarehouseModel.find({ Barcode: { $in: StoreFilteredList.map((x) => x.Barcode) }}).sort('Barcode');//.skip(skip).limit(limit);

        let ProductFilteredList = PrepareClientProductList(WarehouseFilteredList, StoreFilteredList);    
        await SortProductList(columnType, ProductFilteredList, columnName, sortDirection);
        ProductFilteredList = ProductFilteredList.slice(skip);
        ProductFilteredList.length = limit;
        
        res.status(200).json({ProductList: ProductFilteredList});

    } catch (error) {
        res.status(404).json({message: error.message });
        
    }
}

//endregion

// #region Upload Actions 

export const InsertAndUpdateWarehouseProducts = async (req,res) =>{
    if(req.body.length > 0)
    {  
        const csvObjectArray = req.body;
        const length = csvObjectArray.length;

        //to remove extra empty object from array of objects  
        if(csvObjectArray[length-1].sku == '' ){
            csvObjectArray.pop(); 
        }

        const WarehouseModelList = ConvertToArrayWarehouseModelInstances(csvObjectArray);

        try {   
            
            WarehouseModelList.map(async (x) => {
                var dbObjWarehouse = await WarehouseModel.findOne({Barcode: x.Barcode});

                if(dbObjWarehouse != null)
                {  
                    if(dbObjWarehouse.Quantity != x.Quantity)
                    {
                        const Warehouse_hObj = new Warehouse_hModel({ 
                            Barcode: dbObjWarehouse.Barcode, 
                            Quantity: dbObjWarehouse.Quantity, 
                            CreatedBy: dbObjWarehouse.CreatedBy, 
                            CreatedOn: dbObjWarehouse.CreatedOn, 
                            UpdatedBy: dbObjWarehouse.UpdatedBy,  
                            UpdatedOn: dbObjWarehouse.UpdatedOn,
                            PostedBy: "PostingUser"                         
                        });
                        await Warehouse_hObj.save();
    
                        const updatedObj = await WarehouseModel.findByIdAndUpdate(
                            { _id: dbObjWarehouse._id },
                            {
                                Quantity: x.Quantity,
                                UpdatedBy: "Test"  ,
                                UpdatedOn: new Date(),                      
                            },
                            {
                                new: true 
                            });
                    }
                }
                else
                {
                    const insertedObj = await x.save();
                }
            });
            // await WarehouseModel.insertMany(WarehouseModelList);
            
            res.status(201).json({ message: "Success" });
        } catch (error) {
            res.status(409).json({ message: error.message });
        }
    }
}

export const InsertAndUpdateStoreProducts = async (req,res) =>{
    if(req.body.length > 0)
    {  
        const csvObjectArray = req.body;
        const length = csvObjectArray.length;

        //to remove extra empty object from array of objects  
        if(csvObjectArray[length-1].sku == '' ){
            csvObjectArray.pop(); 
        }

        const StoreModelList = ConvertToArrayStoreModelInstances(csvObjectArray);

        try {   
            
            StoreModelList.map(async (x) => {
                var dbObjStore = await StoreModel.findOne({Barcode: x.Barcode});

                if(dbObjStore != null)
                {                  
                    if(dbObjStore.Quantity != x.Quantity)
                    {

                        const Store_hObj = new Store_hModel({ 
                            ProductName: dbObjStore.ProductName,                        
                            Barcode: dbObjStore.Barcode, 
                            Quantity: dbObjStore.Quantity, 
                            Classification: dbObjStore.Classification,
                            CreatedBy: dbObjStore.CreatedBy, 
                            CreatedOn: dbObjStore.CreatedOn, 
                            UpdatedBy: dbObjStore.UpdatedBy,  
                            UpdatedOn: dbObjStore.UpdatedOn,
                            PostedBy: "PostingUser"                         
                        });                    
                        await Store_hObj.save();
    
                        const updatedObj = await StoreModel.findByIdAndUpdate(
                            { _id: dbObjStore._id },
                            {
                                Quantity: x.Quantity,
                                UpdatedBy: "Test"  ,
                                UpdatedOn: new Date(),                      
                            },
                            {
                                new: true 
                            });
                    }
                }
                else
                {
                    const insertedObj = await x.save();
                }
            });
            
            res.status(201).json({ message: "Store Sheet Inserted Successfully" });
        } catch (error) {
            res.status(409).json({ message: error.message });
        }
    }
    else{
        console.log("empty list");
    }
}

// #endregion

// #region Misc Methods

function PrepareClientProductList(WarehouseList, StoreList) {
    let ProductList = [];
    WarehouseList.forEach((item) => {
        StoreList.find((s) => {
            if (s.Barcode === item.Barcode) {
                ProductList.push({
                    '_id': item._id,
                    'Name': s.ProductName,
                    'BarCode': s.Barcode,
                    'StoreQty': s.Quantity,
                    'WarehouseQty': item.Quantity,
                    'TotalQty': s.Quantity + item.Quantity,
                    'Classification': s.Classification,
                });
            }
        });
    });
    return ProductList;
}


async function SortProductList(columnType, ProductFilteredList, columnName, sortDirection) {
    if (columnType == 'string') {
        ProductFilteredList.sort((a, b) => {
            const nameA = a[columnName].toUpperCase(); // ignore upper and lowercase
            const nameB = b[columnName].toUpperCase(); // ignore upper and lowercase
            if (nameA < nameB) {
                return sortDirection === 'ASC' ? -1 : 1;
            }
            if (nameA > nameB) {
                return sortDirection === 'ASC' ? 1 : -1;
            }
            // names must be equal
            return 0;
        });
    }
    else if (columnType == 'number') {
        ProductFilteredList.sort(function (a, b) { return sortDirection === 'ASC' ? a[columnName] - b[columnName] : b[columnName] - a[columnName]; });
    }
}


// #endregion

// #region Convertor Methods

function ConvertToArrayWarehouseModelInstances(ArrayList){
    return ArrayList.map(x => new WarehouseModel({ 
        Barcode: x.sku, 
        Quantity: x.qty, 
        CreatedBy: 'ADMIN', 
        UpdatedBy: 'ADMIN' 
    })
    );
}

function ConvertToArrayStoreModelInstances(ArrayList){
    return ArrayList.map(x => new StoreModel({ 
        ProductName: x.name,
        Barcode: x.sku, 
        Quantity: x.qty, 
        Classification: x.classification,
        CreatedBy: 'ADMIN', 
        UpdatedBy: 'ADMIN' 
    })
    );
}

// #endregion
