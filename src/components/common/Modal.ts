import { IModal, AppEvents } from "../../types";
import { IEvents } from "../base/events";
import { ensureElement } from "../../utils/utils";

export class Modal implements IModal {
    protected _modal: HTMLElement;
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;
    protected events: IEvents;

    constructor(modalElement: HTMLElement, events: IEvents) {
        this._modal = modalElement;
        this.events = events;
        
        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', this._modal);
        this._content = ensureElement<HTMLElement>('.modal__content', this._modal);

        this._closeButton.addEventListener('click', this.close.bind(this));
        this._modal.addEventListener('click', this.handleOutsideClick.bind(this));
    }

    open(): void {
        this._modal.classList.add('modal_active');
        document.addEventListener('keydown', this.handleEscape.bind(this));
        this.events.emit(AppEvents.MODAL_OPEN);
    }

    close(): void {
        this._modal.classList.remove('modal_active');
        document.removeEventListener('keydown', this.handleEscape.bind(this));
        this.events.emit(AppEvents.MODAL_CLOSE);
    }

    setContent(content: HTMLElement): void {
        this._content.innerHTML = '';
        this._content.appendChild(content);
    }

    private handleEscape(evt: KeyboardEvent): void {
        if (evt.key === 'Escape') {
            this.close();
        }
    }

    private handleOutsideClick(evt: MouseEvent): void {
        if (evt.target === this._modal) {
            this.close();
        }
    }
}