import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StockDetailsPageComponent } from './stock-details-page.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { Store } from '@ngrx/store';
import { BuyAction } from '../../store/actions/portfolio';


describe('StockDetailsPageComponent', () => {
  let component: StockDetailsPageComponent;
  let fixture: ComponentFixture<StockDetailsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers),
        RouterTestingModule,
      ],
      declarations: [ StockDetailsPageComponent ],
      providers: [ Store ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockDetailsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('stockExists method', () => {
    beforeEach(() => {
      component.stocks = [
        {'name': 'AAPL'},
        {'name': 'MSFT'}
      ];
    });

    it('should return true if stock exists', () => {
      expect(component['stockExists']('aapl')).toEqual(true);
      expect(component['stockExists']('AAPL')).toEqual(true);
    });

    it('should return false if stock doesn\'t exist', () => {
      expect(component['stockExists']('A')).toEqual(false);
      expect(component['stockExists']('')).toEqual(false);
      expect(component['stockExists'](' ')).toEqual(false);
    });

    it('should return false if input is incorrect', () => {
      expect(component['stockExists'](undefined)).toEqual(false);
      expect(component['stockExists'](null)).toEqual(false);
    });
  });

  describe('buy method', () => {
    beforeEach(() => {
      component.tickerSymbol = 'aapl';
      component.stocks = [
        {'name': 'AAPL', 'quote': { 'latestPrice': 100.00 } },
        {'name': 'MSFT', 'quote': { 'latestPrice': 90.00 } }
      ];
    });

    it('should buy units of a stock if units valid', () => {
      const store = fixture.debugElement.injector.get(Store);
      const storeSpy = spyOn(store, <never>'dispatch').and.callThrough();
      component.buy('10000');
      expect(storeSpy).toHaveBeenCalled();
      component.buy('10000.01');
      expect(storeSpy).toHaveBeenCalled();
    });

    it('should not buy units of a stock if units invalid', () => {
      const store = fixture.debugElement.injector.get(Store);
      const storeSpy = spyOn(store, <never>'dispatch').and.callThrough();
      component.buy('NaN');
      expect(storeSpy).not.toHaveBeenCalled();
      component.buy(null);
      expect(storeSpy).not.toHaveBeenCalled();
    });
  });

  describe('sell method', () => {
    it('should sell units of a stock if units valid and enough stocks', () => {

    });
  });

  describe('enoughStock method', () => {
    beforeEach(() => {
      const stocks = [
        { symbol: 'aapl', units: 20, pricePerUnit: 80.0 },
        { symbol: 'msft', units: 20, pricePerUnit: 60.0 }
      ];

      component['store'].dispatch(new BuyAction(stocks[0]));
      component['store'].dispatch(new BuyAction(stocks[1]));
    });

    it('should return true if there are enough units of a stock', () => {
      let id;
      component['store'].select('portfolio').subscribe((portfolio) => id = portfolio.stockItems[0].id);

      expect(component['enoughStock'](id, 10)).toBeTruthy();
      expect(component['enoughStock'](id, 20)).toBeTruthy();
    });

    it('should return false if there are not enough units of a stock', () => {
      let id;
      component['store'].select('portfolio').subscribe((portfolio) => id = portfolio.stockItems[0].id);

      expect(component['enoughStock']('300', 10)).not.toBeTruthy();
      expect(component['enoughStock'](id, 30)).not.toBeTruthy();
      expect(component['enoughStock']('300', 30)).not.toBeTruthy();
    });

    it('should return false if inputs are incorrect', () => {
      let id;
      component['store'].select('portfolio').subscribe((portfolio) => id = portfolio.stockItems[0].id);

      expect(component['enoughStock']('300', NaN)).not.toBeTruthy();
      expect(component['enoughStock'](null, 30)).not.toBeTruthy();
    });
  });
});
