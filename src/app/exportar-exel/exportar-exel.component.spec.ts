import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportarExelComponent } from './exportar-exel.component';

describe('ExportarExelComponent', () => {
  let component: ExportarExelComponent;
  let fixture: ComponentFixture<ExportarExelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportarExelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportarExelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
