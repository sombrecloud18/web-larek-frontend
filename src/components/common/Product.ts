import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { ProductPreview } from "./ProductPreview";
import { AppEvents } from "../../types";
import { IProduct, TBasketItem } from "../../types"; 

export class Product extends ProductPreview {
    protected _description: HTMLElement;
    protected _button: HTMLButtonElement;

    constructor(template: HTMLTemplateElement, events: IEvents) {
        super(template, events);
        this._description = ensureElement<HTMLElement>('.card__text', this.container);
        this._button = ensureElement<HTMLButtonElement>('.card__button', this.container);
    }

    render(data: IProduct): HTMLElement {
        super.render(data); 
        this.setText(this._description, data.description || '');
        
        this._button.replaceWith(this._button.cloneNode(true) as HTMLButtonElement);
        this._button = ensureElement<HTMLButtonElement>('.card__button', this.container);
        
        this._button.addEventListener('click', (e) => {
            e.stopPropagation();
            const basketItem: TBasketItem = {
                id: data.id,
                title: data.title,
                price: data.price
            };
            this.events.emit(AppEvents.PRODUCT_ADD, basketItem);
        });
        
        return this.container;
    }
}