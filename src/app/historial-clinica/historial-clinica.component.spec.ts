import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistorialClinicaComponent } from './historial-clinica.component';

describe('HistorialClinicaComponent', () => {
  let component: HistorialClinicaComponent;
  let fixture: ComponentFixture<HistorialClinicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistorialClinicaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistorialClinicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
