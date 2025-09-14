import { IBasket, TBasketItem } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/components";
import { IEvents } from "../base/events";
import { AppEvents } from "../../types";
import { BasketItem } from "./BasketItem";

export class Basket extends Component<IBasket>{
    protected _basketList: HTMLElement;
    protected _total: HTMLElement;
    protected _orderButton: HTMLButtonElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        this._basketList = ensureElement<HTMLElement>('.basket__list', this.container);
        this._total = ensureElement<HTMLElement>('.basket__price', this.container);
        this._orderButton = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        if (this._orderButton) {
            this._orderButton.addEventListener('click', () => {
                this.events.emit(AppEvents.BASKET_SUBMIT);
            });
        }
    }

    render(data?: Partial<IBasket>): HTMLElement {
        if (data && 'items' in data) {
            this.renderBasket(data.items as TBasketItem[]);
        }
        if (data && 'totalAmount' in data) {
            this.updateTotal(data.totalAmount as number);
        }
        return this.container;
    }
    renderBasket(items: TBasketItem[]) {
        this._basketList.innerHTML = '';
        items.forEach((item, index) => {
            const template = document.getElementById('card-basket') as HTMLTemplateElement;
            if (template) {
                const basketItemElement = template.content.cloneNode(true) as DocumentFragment;
                const basketItemContainer = basketItemElement.firstElementChild as HTMLElement;
                
                const basketItem = new BasketItem(basketItemContainer, this.events);
                basketItem.render({...item, index});
                
                this._basketList.appendChild(basketItemContainer);
            }
        });
    }

    get containerElement(): HTMLElement {
        return this.container;
    }

    updateTotal(total: number): void {
        this.setText(this._total, `${total} синапсов`);
    }
}