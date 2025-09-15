// components/common/Basket.ts
import { IBasket } from "../../types";
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

        this._basketList.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            const deleteButton = target.closest('.basket__item-delete');
            if (deleteButton) {
                e.preventDefault();
                e.stopPropagation();
                const itemElement = deleteButton.closest('.basket__item') as HTMLElement;;
                if (itemElement && itemElement.dataset.id) {
                    this.events.emit(AppEvents.PRODUCT_REMOVE, itemElement.dataset.id);
                }
            }
        });

        if (this._orderButton) {
            this._orderButton.addEventListener('click', () => {
                this.events.emit(AppEvents.BASKET_SUBMIT);
            });
        }
    }

    setBasketList(html: string): void {
        this._basketList.innerHTML = html;
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