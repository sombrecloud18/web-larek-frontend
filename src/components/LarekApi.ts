// LarekApi.ts
import { ILarekApi, IOrder, IOrderResult, IProduct, ApiListResponse } from "../types/index";
import { Api } from "./base/api";

export class LarekApi extends Api implements ILarekApi {
    getProductList() {
        return this.get('/product')
        .then((data: ApiListResponse<IProduct>) => data.items);
    }

    getProduct(id: string) {
        return this.get(`/product/${id}`) as Promise<IProduct>;
    };

    createOrder(order: IOrder) {
        return this.post('/order', order) as Promise<IOrderResult>;
    };
}