import { ensureElement } from "../../utils/utils";
import { ISuccessOrder } from "../../types";
import { Component } from "../base/components";
import { IEvents } from "../base/events";

export class SuccessOrder extends Component<ISuccessOrder> {
    protected _totalElement: HTMLElement;
    protected _closeButton: HTMLButtonElement;
    protected events: IEvents;

    constructor(container: HTMLElement, events: IEvents) {
        super(container);
        this.events = events;
        
        this._totalElement = ensureElement<HTMLElement>('.order-success__description', container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', container);
        
        this._closeButton.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    set total(value: number) {
        this._totalElement.textContent = `Списано ${value} синапсов`;
    }

    render(data: ISuccessOrder): HTMLElement {
        this.total = data.total;
        return this.container;
    }
}