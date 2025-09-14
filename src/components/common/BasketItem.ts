import { Component } from "../base/components";
import { TBasketItem } from "../../types";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";
import { AppEvents } from "../../types";

export class BasketItem extends Component<TBasketItem> {
    protected _index: HTMLElement;
    protected _title: HTMLElement;
    protected _price: HTMLElement;
    protected _deleteButton: HTMLButtonElement;
    protected _events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this._events = events;
        
        this._index = ensureElement<HTMLElement>('.basket__item-index', container);
        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);
        this._deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', container);
        
        this._deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this._events.emit(AppEvents.PRODUCT_REMOVE, this.container.dataset.id);
        });
    }

    render(data: Partial<TBasketItem> & { index?: number } = {}): HTMLElement {
        if (data.id && data.title && data.price !== undefined && data.index !== undefined) {
            this.container.dataset.id = data.id;
            this.setText(this._index, String(data.index + 1));
            this.setText(this._title, data.title);
            this.setText(this._price, `${data.price} синапсов`);
        }
        return this.container;
    }
}