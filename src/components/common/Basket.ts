import { IBasket, TBasketItem } from "../../types";
import { ensureElement } from "../../utils/utils";
import { Component } from "../base/components";
import { IEvents } from "../base/events";
import { AppEvents } from "../../types";

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
                const basketItem = template.content.cloneNode(true) as DocumentFragment;
                
                const indexEl = basketItem.querySelector('.basket__item-index');
                const titleEl = basketItem.querySelector('.card__title');
                const priceEl = basketItem.querySelector('.card__price');
                const deleteBtn = basketItem.querySelector('.basket__item-delete');

                if (indexEl) indexEl.textContent = String(index + 1);
                if (titleEl) titleEl.textContent = item.title;
                if (priceEl) priceEl.textContent = `${item.price} синапсов`;
                
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        this.events.emit(AppEvents.PRODUCT_REMOVE, item.id);
                    });
                }

                this._basketList.appendChild(basketItem);
            }
        });
    }

    updateTotal(total: number): void {
        this.setText(this._total, `${total} синапсов`);
    }
}