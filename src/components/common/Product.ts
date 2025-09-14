// Product.ts
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { ProductPreview } from "./ProductPreview";
import { AppEvents } from "../../types";
import { IProduct, TBasketItem } from "../../types"; 

export class Product extends ProductPreview {
    protected _description: HTMLElement;
    protected _button: HTMLButtonElement;
    protected _checkInBasket: (id: string) => boolean;
    protected _currentProduct: IProduct;

    constructor(template: HTMLTemplateElement, events: IEvents, checkInBasket: (id: string) => boolean) {
        super(template, events);
        this._checkInBasket = checkInBasket;
        this._description = ensureElement<HTMLElement>('.card__text', this.container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', this.container);
    }

    render(data: IProduct): HTMLElement {
        super.render(data); 
        this._currentProduct = data;
        this.setText(this._description, data.description || '');
        const inBasket = this._checkInBasket(data.id);
        const hasPrice = data.price !== null && data.price !== undefined && data.price > 0;
        this.updateButtonState(inBasket, hasPrice);
        
        return this.container;
    }

    protected updateButtonState(inBasket: boolean, hasPrice: boolean): void {
        this._button.replaceWith(this._button.cloneNode(true) as HTMLButtonElement);
        this._button = ensureElement<HTMLButtonElement>('.card__button', this.container);
        
        if (inBasket) {
            this._button.textContent = 'Удалить из корзины';
            this._button.classList.add('card__button--remove');
            this._button.classList.remove('card__button--add');
            
            this._button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.events.emit(AppEvents.PRODUCT_REMOVE_FROM_PREVIEW, this._currentProduct.id);
            });
            
        } else if (!hasPrice) {
            this._button.textContent = 'Недоступно';
            this._button.disabled = true;
            this._button.classList.remove('card__button--add', 'card__button--remove');
            
        } else {
            this._button.textContent = 'В корзину';
            this._button.disabled = false;
            this._button.classList.add('card__button--add');
            this._button.classList.remove('card__button--remove');
            
            this._button.addEventListener('click', (e) => {
                e.stopPropagation();
                const basketItem: TBasketItem = {
                    id: this._currentProduct.id,
                    title: this._currentProduct.title,
                    price: this._currentProduct.price
                };
                this.events.emit(AppEvents.PRODUCT_ADD, basketItem);
            });
        }
    }
}