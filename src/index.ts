import { EventEmitter, IEvents } from './components/base/events';
import { LarekApi } from './components/LarekApi';
import { OrderData } from './components/OrderData';
import { ProductData } from './components/ProductData';
import { Page } from './components/Page';
import { Modal } from './components/common/Modal';
import { Product } from './components/common/Product';
import './scss/styles.scss';
import { ILarekApi, IOrder, IOrderResult, IProduct, TBasketItem, TOrderContactsInfo, TOrderPaymentInfo } from './types';
import { API_URL, settings } from './utils/constants';
import { AppEvents } from './types';
import { Basket } from './components/common/Basket';
import { FormPayments } from './components/common/FormPayments';
import { FormContacts } from './components/common/FormContacts';
import { SuccessOrder } from './components/common/SuccessOrder';

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
let basket: Basket;

// Инициализация API
const api: ILarekApi = new LarekApi(API_URL, settings);

// Обработчик открытия детального просмотра товара
events.on(AppEvents.PRODUCT_OPEN, (product: IProduct) => {
    const template = document.getElementById('card-preview') as HTMLTemplateElement;
    if (template) {
        const productView = new Product(template, events);
        const productElement = productView.render(product);
        modal.setContent(productElement);
        modal.open();
    }
});

// Обработчик открытия корзины
events.on(AppEvents.BASKET_OPEN, () => {
    const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
    if (!basketTemplate) return;
    
    const basketContainer = basketTemplate.content.cloneNode(true) as DocumentFragment;
    const basketElement = basketContainer.firstElementChild as HTMLElement;
    
    const basket = new Basket(basketElement, events);
    
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
    
    if (basket) {
        basket.renderBasket(items);
        basket.updateTotal(orderData.getTotal());
    }
});

// Обработчик успешной загрузки товаров
events.on(AppEvents.PRODUCTS_CHANGED, (items: IProduct[]) => {
    productData.setProductList(items);
    page.renderProducts(items, events);
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

events.on(AppEvents.BASKET_SUBMIT, () => {
    const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
    if (orderTemplate) {
        const orderFormElement = orderTemplate.content.cloneNode(true) as DocumentFragment;
        const formElement = orderFormElement.querySelector('form') as HTMLFormElement;
        
        if (formElement) {
            const paymentForm = new FormPayments(formElement, events);
            events.on('order.payment:change', (data: { field: string, value: string }) => {
                orderData.setOrderField(data.field as keyof TOrderPaymentInfo, data.value);
            });
            
            events.on('order.address:change', (data: { field: string, value: string }) => {
                orderData.setOrderField(data.field as keyof TOrderPaymentInfo, data.value);
            });

            events.on(AppEvents.ORDER_VALIDITY_CHANGED, (isValid: boolean) => {
                const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
                if (submitButton) {
                    submitButton.disabled = !isValid;
                }
            });
            
            events.on('order:submit', () => {
                if (orderData.validateOrder()) {
                    const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
                    if (contactsTemplate) {
                        const contactsFormElement = contactsTemplate.content.cloneNode(true) as DocumentFragment;
                        const contactsForm = contactsFormElement.querySelector('form') as HTMLFormElement;
                        
                        if (contactsForm) {
                            const formContacts = new FormContacts(contactsForm, events);
                            
                            events.on('contacts.email:change', (data: { field: string, value: string }) => {
                                orderData.setContactsField(data.field as keyof TOrderContactsInfo, data.value);
                            });
                            
                            events.on('contacts.phone:change', (data: { field: string, value: string }) => {
                                orderData.setContactsField(data.field as keyof TOrderContactsInfo, data.value);
                            });

                            events.on(AppEvents.CONTACTS_VALIDITY_CHANGED, (isValid: boolean) => {
                                const submitButton = contactsForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                                if (submitButton) {
                                    submitButton.disabled = !isValid;
                                }
                            });
                            
                            events.on('contacts:submit', () => {
                                if (orderData.validateContacts()) {
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
                                            
                                            const successOrder = new SuccessOrder(successContent, events);
                                            successOrder.total = result.total; 
                                            
                                            events.on('success:close', () => {
                                                modal.close();
                                                orderData.clearBasket();
                                                orderData.clearDataForms();
                                                page.updateBasketCounter(0);
                                            });
                                            
                                            modal.setContent(successContent);
                                        }
                                    })
                                    .catch(error => {
                                        console.error('Ошибка оформления заказа:', error);
                                    });
                                }
                            });
                            
                            const submitButton = contactsForm.querySelector('button[type="submit"]') as HTMLButtonElement;
                            if (submitButton) {
                                submitButton.disabled = !orderData.isContactsFormValid;
                            }
                            
                            modal.setContent(contactsForm);
                        }
                    }
                }
            });
            
            const submitButton = formElement.querySelector('button[type="submit"]') as HTMLButtonElement;
            if (submitButton) {
                submitButton.disabled = !orderData.isOrderFormValid;
            }
            
            modal.setContent(formElement);
            modal.open();
        }
    }
});

events.on(AppEvents.MODAL_OPEN, () => {
    page.setLocked(true); 
});

events.on(AppEvents.MODAL_CLOSE, () => {
    page.setLocked(false); 
});

// Загрузка товаров
api.getProductList()
    .then((items) => {
        productData.setProductList(items); 
        page.renderProducts(items, events);
    })
    .catch((err) => {
        console.error('Ошибка загрузки товаров:', err);
    });
