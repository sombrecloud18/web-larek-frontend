import { EventEmitter, IEvents } from './components/base/events';
import { LarekApi } from './components/LarekApi';
import { OrderData } from './components/OrderData';
import { ProductData } from './components/ProductData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Product } from './components/common/Product';
import './scss/styles.scss';
import { FormErrors, ILarekApi, IOrder, IOrderResult, IProduct, TBasketItem, TOrderContactsInfo, TOrderPaymentInfo } from './types';
import { API_URL, settings } from './utils/constants';
import { AppEvents } from './types';
import { Basket } from './components/common/Basket';
import { FormPayments } from './components/common/FormPayments';
import { FormContacts } from './components/common/FormContacts';
import { SuccessOrder } from './components/common/SuccessOrder';
import { ProductPreview } from './components/common/ProductPreview';

const events: IEvents = new EventEmitter();
const orderData = new OrderData(events);
const productData = new ProductData(events);

// Инициализация страницы
const pageContainer = document.querySelector('.page') as HTMLElement;
const page = new Page(pageContainer, events);

// Инициализация модального окна
const modalContainer = document.getElementById('modal-container') as HTMLElement;
const modal = new Modal(modalContainer, events);

// Инициализация корзины
const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
const basketContainer = basketTemplate.content.cloneNode(true) as DocumentFragment;
const basketElement = basketContainer.firstElementChild as HTMLElement;
const basket = new Basket(basketElement, events);

// Инициализация форм (создаются один раз)
let paymentForm: FormPayments | null = null;
let contactsForm: FormContacts | null = null;
let successOrder: SuccessOrder | null = null;

// Инициализация API
const api: ILarekApi = new LarekApi(API_URL, settings);

// Обработчик для создания карточек продуктов
events.on(AppEvents.PRODUCTS_CHANGED, (products: IProduct[]) => {
    const cardElements = products.map(product => {
        const template = document.getElementById('card-catalog') as HTMLTemplateElement;
        if (!template) return null;
        const card = new ProductPreview(template, events);
        return card.render(product);
    }).filter(Boolean) as HTMLElement[];
    page.catalog = cardElements;
});

// Обработчик открытия детального просмотра товара
events.on(AppEvents.PRODUCT_OPEN, (product: IProduct) => {
    const template = document.getElementById('card-preview') as HTMLTemplateElement;
    if (template) {
        const productView = new Product(template, events, (id: string) => orderData.isProductInBasket(id));
        const productElement = productView.render(product);
        modal.setContent(productElement);
        modal.open();
    }
});

// Обработчик открытия корзины
events.on(AppEvents.BASKET_OPEN, () => {
    if (!basketTemplate) return;
    const basketItems = orderData.basket;
    const total = orderData.getTotal();
    basket.renderBasket(basketItems);
    basket.updateTotal(total);
    modal.setContent(basketElement);
    modal.open();
});

// Обработчик изменения корзины
events.on(AppEvents.BASKET_CHANGED, (items: TBasketItem[]) => {
    page.updateBasketCounter(items.length);
    if (basket && modal.isOpen()) {
        basket.renderBasket(items);
        basket.updateTotal(orderData.getTotal());
        if (items.length === 0) {
            modal.close();
        }
    }
});

// Обработчик успешной загрузки товаров
events.on(AppEvents.PRODUCTS_LOADED, (items: IProduct[]) => {
    productData.setProductList(items);
    events.emit(AppEvents.PRODUCTS_CHANGED, items);
});

// Обработчик обновления общей суммы
events.on(AppEvents.TOTAL_UPDATED, (total: number) => {
    if (basket) {
        basket.updateTotal(total);
    }
});

// Обработчик добавления товара в корзину
events.on(AppEvents.PRODUCT_ADD, (basketItem: TBasketItem) => {
    try {
        orderData.addProduct(basketItem);
        page.updateBasketCounter(orderData.basket.length);
        modal.close();
    } catch (error) {
        console.error('Ошибка добавления товара в корзину:', error);
    }
});

// Обработчик удаления товара из корзины
events.on(AppEvents.PRODUCT_REMOVE, (productId: string) => {
    orderData.deleteProduct(productId);
});

// Обработчик удаления товара из корзины через модальное окно товара
events.on(AppEvents.PRODUCT_REMOVE_FROM_PREVIEW, (productId: string) => {
    orderData.deleteProduct(productId);
    modal.close();
});

// Обработчик изменения ошибок формы
events.on(AppEvents.FORM_ERRORS_CHANGED, (errors: FormErrors) => {
    const modalContent = modal.getContent();
    if (modalContent && paymentForm && paymentForm.isActive()) {
        paymentForm.showErrors(errors);
    }
    if (modalContent && contactsForm && contactsForm.isActive()) {
        contactsForm.showErrors(errors);
    }
});

// Обработчик изменения способа оплаты
events.on(AppEvents.ORDER_PAYMENT_CHANGE, (data: { field: string, value: string }) => {
    orderData.setOrderField(data.field as keyof TOrderPaymentInfo, data.value);
});

// Обработчик изменения адреса
events.on(AppEvents.ORDER_ADDRESS_CHANGE, (data: { field: string, value: string }) => {
    orderData.setOrderField(data.field as keyof TOrderPaymentInfo, data.value);
});

// Обработчик изменения валидности формы оплаты
events.on(AppEvents.ORDER_VALIDITY_CHANGED, (isValid: boolean) => {
    if (paymentForm && paymentForm.isActive()) {
        paymentForm.setSubmitButtonState(isValid);
    }
});

// Обработчик отправки формы оплаты
events.on(AppEvents.ORDER_SUBMIT, () => {
    if (orderData.validateOrder()) {
        const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
        if (contactsTemplate) {
            const contactsFormElement = contactsTemplate.content.cloneNode(true) as DocumentFragment;
            const contactsFormElementQuery = contactsFormElement.querySelector('form') as HTMLFormElement;
            if (contactsFormElementQuery) {
                if (!contactsForm) {
                    contactsForm = new FormContacts(contactsFormElementQuery, events);
                } else {
                    contactsForm.container = contactsFormElementQuery;
                }
                contactsForm.setSubmitButtonState(orderData.isContactsFormValid);
                
                modal.setContent(contactsFormElementQuery);
            }
        }
    } else {
        events.emit(AppEvents.FORM_ERRORS_CHANGED, orderData.formErrors);
    }
});

// Обработчик изменения email
events.on(AppEvents.CONTACTS_EMAIL_CHANGE, (data: { field: string, value: string }) => {
    orderData.setContactsField(data.field as keyof TOrderContactsInfo, data.value);
});

// Обработчик изменения телефона
events.on(AppEvents.CONTACTS_PHONE_CHANGE, (data: { field: string, value: string }) => {
    orderData.setContactsField(data.field as keyof TOrderContactsInfo, data.value);
});

// Обработчик изменения валидности формы контактов
events.on(AppEvents.CONTACTS_VALIDITY_CHANGED, (isValid: boolean) => {
    if (contactsForm && contactsForm.isActive()) {
        contactsForm.setSubmitButtonState(isValid);
    }
});

// Обработчик отправки формы контактов
events.on(AppEvents.CONTACTS_SUBMIT, () => {
    if (!orderData.validateContacts()) {
        events.emit(AppEvents.FORM_ERRORS_CHANGED, orderData.formErrors);
    } else {
        const total = orderData.getTotal();
        const items = orderData.basket.map(item => item.id);
        const order: IOrder = {
            payment: orderData.order.payment,
            address: orderData.order.address,
            email: orderData.order.email,
            phone: orderData.order.phone,
            total: total,
            items: items
        };
        api.createOrder(order)
            .then((result: IOrderResult) => {
                const successTemplate = document.getElementById('success') as HTMLTemplateElement;
                if (successTemplate) {
                    const successElement = successTemplate.content.cloneNode(true) as DocumentFragment;
                    const successContent = successElement.firstElementChild as HTMLElement;
                    if (!successOrder) {
                        successOrder = new SuccessOrder(successContent, events);
                    }
                    successOrder.total = result.total;
                    modal.setContent(successContent);
                }
            })
            .catch(error => {
                console.error('Ошибка оформления заказа:', error);
            });
    }
});

// Обработчик закрытия окна успешного заказа
events.on(AppEvents.SUCCESS_SUBMIT, () => {
    modal.close();
    orderData.clearBasket();
    orderData.clearDataForms();
    page.updateBasketCounter(0);
});

// Обработчик отправки корзины
events.on(AppEvents.BASKET_SUBMIT, () => {
    const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
    if (orderTemplate) {
        const orderFormElement = orderTemplate.content.cloneNode(true) as DocumentFragment;
        const formElement = orderFormElement.querySelector('form') as HTMLFormElement;
        if (formElement) {
            if (!paymentForm) {
                paymentForm = new FormPayments(formElement, events);
            } else {
                paymentForm.container = formElement;
            }
            paymentForm.setSubmitButtonState(orderData.isOrderFormValid);
            
            modal.setContent(formElement);
            modal.open();
        }
    }
});

// Обработчик открытия модального окна
events.on(AppEvents.MODAL_OPEN, () => {
    page.setLocked(true);
});

// Обработчик закрытия модального окна
events.on(AppEvents.MODAL_CLOSE, () => {
    page.setLocked(false);
});

// Загрузка товаров
api.getProductList()
    .then((items) => {
        productData.setProductList(items);
        events.emit(AppEvents.PRODUCTS_LOADED, items);
    })
    .catch((err) => {
        console.error('Ошибка загрузки товаров:', err);
    });