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
    protected _inBasket: boolean;
    protected _hasPrice: boolean;

    constructor(template: HTMLTemplateElement, events: IEvents, checkInBasket: (id: string) => boolean) {
        super(template, events);
        this._checkInBasket = checkInBasket;
        this._description = ensureElement<HTMLElement>('.card__text', this.container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', this.container);

        this._button.addEventListener('click', () => {
            if (this._inBasket) {
                this.events.emit(AppEvents.PRODUCT_REMOVE, this._currentProduct.id);
            } else if (this._hasPrice) {
                const basketItem: TBasketItem = {
                    id: this._currentProduct.id,
                    title: this._currentProduct.title,
                    price: this._currentProduct.price
                };
                this.events.emit(AppEvents.PRODUCT_ADD, basketItem);
            }
        });
    }

    render(data: IProduct): HTMLElement {
        super.render(data); 
        this._currentProduct = data;
        this.setText(this._description, data.description || '');
        
        this._inBasket = this._checkInBasket(data.id);
        this._hasPrice = data.price !== null && data.price !== undefined && data.price > 0;
        
        if (!this._hasPrice) {
            this._price.textContent = 'Бесценно';
        }
        
        this.updateButtonState();
        
        return this.container;
    }

    protected updateButtonState(): void {
        if (this._inBasket) {
            this._button.textContent = 'Удалить из корзины';
            this._button.classList.add('card__button--remove');
            this._button.classList.remove('card__button--add');
            this._button.disabled = false;
        } else if (!this._hasPrice) {
            this._button.textContent = 'Недоступно';
            this._button.disabled = true;
            this._button.classList.remove('card__button--add', 'card__button--remove');
        } else {
            this._button.textContent = 'В корзину';
            this._button.disabled = false;
            this._button.classList.add('card__button--add');
            this._button.classList.remove('card__button--remove');
        }
    }
}