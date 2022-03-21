import WarehouseModel from "../models/WarehouseModel.js";
import StoreModel from "../models/StoreModel.js";
import Store_hModel from "../models/Store_hModel.js";
import Warehouse_hModel from "../models/Warehouse_hModel.js";
import csv from "csv-parser" ;
import fs from "fs" ;

// #region Get Actions

export const FindAllProducts = async (req,res) =>{
    try {
        const WarehouseList = await WarehouseModel.find().sort('Barcode').skip(0).limit(10);
        const StoreList = await StoreModel.find().sort('Barcode').skip(0).limit(10);
        const TotalRecord = await StoreModel.count();
        let ProductList = PrepareClientProductList(WarehouseList, StoreList);    
        console.log(WarehouseList, StoreList);
        res.status(200).json({ProductList, TotalRecord});

    } catch (error) {
        res.status(404).json({message: error.message });
    }
}

export const FindProductsByBarcode = async (req,res) => {
    try {
        const { searchText } = req.query;
        const WarehouseFilteredList = await WarehouseModel.find({Barcode: new RegExp('.*'+searchText+'.*')});
        const StoreFilteredList = await StoreModel.find({Barcode: new RegExp('.*'+searchText+'.*')});        

        let ProductFilteredList = PrepareClientProductList(WarehouseFilteredList, StoreFilteredList);  
        console.log(ProductFilteredList)

        res.status(200).json(ProductFilteredList);

    } catch (error) {
        res.status(404).json({message: error.message });
        
    }
}


export const GetSortedProductsData = async (req,res) => {
    try {
        const { columnName, sortDirection, columnType, skip, limit } = req.query;
        
        const WarehouseFilteredList = await WarehouseModel.find();
        const StoreFilteredList = await StoreModel.find();        

        let ProductFilteredList = PrepareClientProductList(WarehouseFilteredList, StoreFilteredList);  
        if(columnType == 'string'){            
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
        else if(columnType == 'number'){            
            ProductFilteredList.sort(function(a, b){return sortDirection === 'ASC' ? a[columnName] - b[columnName] : b[columnName]-a[columnName]})
        }
        console.log(ProductFilteredList)

        res.status(200).json(ProductFilteredList);

    } catch (error) {
        res.status(404).json({message: error.message });
        
    }
}

export const ChangePage = async (req,res) => {
    try {
        const { page, size } = req.query;
        const limit = parseInt(size);
        const skip = (parseInt(page) - 1) * limit;
        console.log(page,limit,skip)
        const WarehouseFilteredList = await WarehouseModel.find().sort('Barcode').skip(skip).limit(limit);
        const StoreFilteredList = await StoreModel.find().sort('Barcode').skip(skip).limit(limit);        

        let ProductFilteredList = PrepareClientProductList(WarehouseFilteredList, StoreFilteredList);  

        // console.log('Page   ', ProductFilteredList)

        res.status(200).json(ProductFilteredList);

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
                    if(dbObjStore.Quantity != x.Quantity)
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
