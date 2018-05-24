import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { StockDetailsPageComponent } from './stock-details-page.component';
import { StoreModule } from '@ngrx/store';
import { reducers } from '../../store';
import { Store } from '@ngrx/store';
import { BuyAction, SellAction } from '../../store/actions/portfolio';


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
    let store, storeSpy;

    beforeEach(() => {
      store = fixture.debugElement.injector.get(Store);
      storeSpy = spyOn(store, <never>'dispatch');
      component.tickerSymbol = 'aapl';
      component.stocks = [
        {'name': 'AAPL', 'quote': { 'latestPrice': 100.00 } },
        {'name': 'MSFT', 'quote': { 'latestPrice': 90.00 } }
      ];
    });

    it('should buy units of a stock if units valid', () => {
      component.buy('10000');
      expect(storeSpy).toHaveBeenCalled();
      component.buy('10000.01');
      expect(storeSpy).toHaveBeenCalled();
    });

    it('should not buy units of a stock if units invalid', () => {
      component.buy('NaN');
      expect(storeSpy).not.toHaveBeenCalled();
      component.buy(null);
      expect(storeSpy).not.toHaveBeenCalled();
    });
  });

  describe('sell method', () => {
    let store, storeSpy;
    const buyStocks = [
      { symbol: 'aapl', units: 20, pricePerUnit: 80.0 },
      { symbol: 'msft', units: 20, pricePerUnit: 60.0 }
    ];

    beforeEach(() => {
      // have to buy stocks before setting up spy (no callThrough)
      component['store'].dispatch(new BuyAction(buyStocks[0]));
      component['store'].dispatch(new BuyAction(buyStocks[1]));

      store = fixture.debugElement.injector.get(Store);
      storeSpy = spyOn(store, <never>'dispatch');
      component.tickerSymbol = 'aapl';
      component.stocks = [
        {'name': 'AAPL', 'quote': { 'latestPrice': 100.00 } },
        {'name': 'MSFT', 'quote': { 'latestPrice': 90.00 } }
      ];
    });

    it('should sell units of a stock if units valid and enough stocks', () => {
      component['store'].select('portfolio').subscribe((portfolio) => {
        const id = portfolio.stockItems[0].id;

        component.sell('10', id);
        expect(storeSpy).toHaveBeenCalledWith(jasmine.any(SellAction));
        component.sell('20', id);
        expect(storeSpy).toHaveBeenCalledWith(jasmine.any(SellAction));
      });
    });

    it('should not sell units of a stock if units invalid or not enough stocks', () => {
      component['store'].select('portfolio').subscribe((portfolio) => {
        const id = portfolio.stockItems[0].id;

        component.sell('30', id);
        expect(storeSpy).not.toHaveBeenCalledWith(jasmine.any(SellAction));
        component.sell('20', 'A');
        expect(storeSpy).not.toHaveBeenCalledWith(jasmine.any(SellAction));
        component.sell('30', 'A');
        expect(storeSpy).not.toHaveBeenCalledWith(jasmine.any(SellAction));
      });
    });
  });

  describe('enoughStock method', () => {
    const stocks = [
      { symbol: 'aapl', units: 20, pricePerUnit: 80.0 },
      { symbol: 'msft', units: 20, pricePerUnit: 60.0 }
    ];
    beforeEach(() => {
      component['store'].dispatch(new BuyAction(stocks[0]));
      component['store'].dispatch(new BuyAction(stocks[1]));
    });

    it('should return true if there are enough units of a stock', () => {
      component['store'].select('portfolio').subscribe((portfolio) => {
        const id = portfolio.stockItems[0].id;
        expect(component['enoughStock'](id, 10)).toBeTruthy();
        expect(component['enoughStock'](id, 20)).toBeTruthy();
      });
    });

    it('should return false if there are not enough units of a stock', () => {
      component['store'].select('portfolio').subscribe((portfolio) => {
        const id = portfolio.stockItems[0].id;
        expect(component['enoughStock']('300', 10)).not.toBeTruthy();
        expect(component['enoughStock'](id, 30)).not.toBeTruthy();
        expect(component['enoughStock']('300', 30)).not.toBeTruthy();
      });
    });

    it('should return false if inputs are incorrect', () => {
      component['store'].select('portfolio').subscribe((portfolio) => {
        const id = portfolio.stockItems[0].id;
        expect(component['enoughStock']('300', NaN)).not.toBeTruthy();
        expect(component['enoughStock'](null, 30)).not.toBeTruthy();
      });
    });
  });
});
