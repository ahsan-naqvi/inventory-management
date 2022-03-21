import express from "express";
import { FindAllProducts, FindProductsByBarcode, GetSortedProductsData, InsertAndUpdateWarehouseProducts, InsertAndUpdateStoreProducts, ChangePage } from '../controllers/ProductController.js'

const router = express.Router();

router.get('/', FindAllProducts );
router.get('/FindProductsByBarcode', FindProductsByBarcode );
router.get('/SortByColumn', GetSortedProductsData );
router.get('/ChangePage', ChangePage );
router.post('/InsertAndUpdateWarehouseProducts', InsertAndUpdateWarehouseProducts );
router.post('/InsertAndUpdateStoreProducts', InsertAndUpdateStoreProducts );


export default router;