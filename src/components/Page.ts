import { IPage, AppEvents } from "../types";
import { IEvents } from "./base/events";
import { ensureElement } from "../utils/utils";
import { Component } from "./base/components";

export class Page extends Component<IPage> {
    protected basketCounter: HTMLElement;
    protected basketButton: HTMLButtonElement;
    protected cardCatalog: HTMLElement;
    protected wrapper: HTMLElement;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
        this.basketButton = ensureElement<HTMLButtonElement>('.header__basket');
        this.cardCatalog = ensureElement<HTMLElement>('.gallery');
        this.wrapper = ensureElement<HTMLElement>('.page__wrapper');

        this.basketButton.addEventListener('click', () => {
            events.emit(AppEvents.BASKET_OPEN);
        });
    }
    
    updateBasketCounter(count: number): void {
        this.setText(this.basketCounter, String(count));
    }

    setLocked(val: boolean): void {
        if (val) {
            this.wrapper.classList.add('page__wrapper_locked');
        } else {
            this.wrapper.classList.remove('page__wrapper_locked');
        }
    }

    set catalog(items: HTMLElement[]) {
        this.cardCatalog.replaceChildren(...items);
    }
}