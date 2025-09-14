import { FormErrors, IOrder, IOrderData, TBasketItem, TOrderContactsInfo, TOrderPaymentInfo, AppEvents } from "../types";
import { IEvents } from "./base/events";

export class OrderData implements IOrderData {
    basket: TBasketItem[] = [];
    order: IOrder = {
        payment: '',
        address: '',
        email: '',
        phone: '',
        total: 0,
        items: [],
    };
    formErrors: FormErrors = {};
    events: IEvents;
    private _orderValid = false;
    private _contactsValid = false;

    constructor(events: IEvents) {
        this.events = events;
    }

    addProduct(item: TBasketItem): void {
        if (item.price === null || item.price === undefined || item.price <= 0) {
            throw new Error('Нельзя добавить товар без цены в корзину');
        }
        if (!this.basket.find(product => product.id === item.id)) {
            this.basket.push(item);
            this.events.emit(AppEvents.BASKET_CHANGED, this.basket);
            this.updateTotal();
        } else {
        console.log('Товар уже в корзине:', item.title);
        }   
    }

    deleteProduct(id: string): void {
        const index = this.basket.findIndex(element => element.id === id);
        if (index !== -1) {
            this.basket.splice(index, 1);
            this.events.emit(AppEvents.BASKET_CHANGED, this.basket);
            this.updateTotal();
        }
    }

    getTotal(): number {
        return this.basket.reduce((sum, item) => sum + item.price, 0);
    }

    updateTotal(): void {
        const total = this.getTotal();
        this.events.emit(AppEvents.TOTAL_UPDATED, total);
    }

    clearDataForms(): void {
        this.order = {
            payment: '',
            address: '',
            email: '',
            phone: '',
            total: 0,
            items: [],
        };
        this.formErrors = {};
    }

    clearBasket(): void {
        this.basket = [];
        this.updateTotal();
        this.events.emit(AppEvents.BASKET_CHANGED, this.basket);
    }

    setOrderField(field: keyof TOrderPaymentInfo, value: string): void {
        this.order[field] = value;
        this.validateOrder();
        this.events.emit(AppEvents.ORDER_VALIDITY_CHANGED, this._orderValid);
    }

    setContactsField(field: keyof TOrderContactsInfo, value: string): void {
        this.order[field] = value;
        this.validateContacts();
        this.events.emit(AppEvents.CONTACTS_VALIDITY_CHANGED, this._contactsValid);
    }

    validateOrder(): boolean {
        const errors: FormErrors = {};
        if (!this.order.payment) errors.payment = 'Выберите способ оплаты';
        if (!this.order.address.trim()) errors.address = 'Введите адрес доставки';
        
        this.formErrors = errors;
        this._orderValid = Object.keys(errors).length === 0;
        this.events.emit(AppEvents.FORM_ERRORS_CHANGED, this.formErrors);
        return this._orderValid;
    }

    validateContacts(): boolean {
        const errors: FormErrors = {};
        if (!this.order.email.trim()) errors.email = 'Введите email';
        if (!this.order.phone.trim()) errors.phone = 'Введите телефон';
        
        this.formErrors = errors;
        this._contactsValid = Object.keys(errors).length === 0;
        this.events.emit(AppEvents.FORM_ERRORS_CHANGED, this.formErrors);
        return this._contactsValid;
    }

    get isOrderFormValid(): boolean {
        return this._orderValid;
    }

    get isContactsFormValid(): boolean {
        return this._contactsValid;
    }

    isProductInBasket(productId: string): boolean {
        return this.basket.some(item => item.id === productId);
    }
}