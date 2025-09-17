// components/common/Basket.ts
import { IBasket, IBasketItem, TBasketItem } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/components";
import { IEvents } from "../base/events";
import { AppEvents } from "../../types";

export class Basket extends Component<IBasket> {
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

    setBasketList(items: HTMLElement[]): void {
        if (items.length) {
            this._basketList.replaceChildren(...items);
        } else {
            const emptyMessage = document.createElement('p');
            emptyMessage.style.color = 'grey';
            emptyMessage.textContent = 'Корзина пуста';
            this._basketList.replaceChildren(emptyMessage);
        }
    }

    updateTotal(total: number): void {
        this.setText(this._total, `${total} синапсов`);
    }

    setOrderButtonState(isEnabled: boolean): void {
        if (this._orderButton) {
            this._orderButton.disabled = !isEnabled;
        }
    }

    get containerElement(): HTMLElement {
        return this.container;
    }
}