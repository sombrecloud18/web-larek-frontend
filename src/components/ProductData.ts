import { IProduct, IProductData } from "../types";
import { IEvents } from "./base/events";

export class ProductData implements IProductData {
    productList: IProduct[];
    events: IEvents;

    constructor(events: IEvents) {
        this.events = events;
    }

    getProductList() {
        return this.productList;
    }

    setProductList(productsData: IProduct[]) {
        this.productList = productsData;
        return this.productList;
    }

    getProductById(id: string) {
        
        const product = this.productList.find(element => {
            element.id === id;
        })
        if (!product) {
            throw new Error(`Product with id = ${id} not found`); 
        }
        return product;
    }
}