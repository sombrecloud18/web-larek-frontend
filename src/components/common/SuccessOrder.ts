// SuccessOrder.ts
import { ensureElement } from "../../utils/utils";
import { AppEvents, ISuccessOrder } from "../../types";
import { Component } from "../base/components";
import { IEvents } from "../base/events";

export class SuccessOrder extends Component<ISuccessOrder> {
    protected _totalElement: HTMLElement;
    protected _closeButton: HTMLButtonElement;
    protected events: IEvents;

    constructor(template: HTMLTemplateElement, events: IEvents) {
        const content = (template.content.cloneNode(true) as HTMLElement).firstElementChild as HTMLElement;
        super(content);
        this.events = events;
        
        this._totalElement = ensureElement<HTMLElement>('.order-success__description', this.container);
        this._closeButton = ensureElement<HTMLButtonElement>('.order-success__close', this.container);
        
        this._closeButton.addEventListener('click', () => {
            this.events.emit(AppEvents.SUCCESS_CLOSE);
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