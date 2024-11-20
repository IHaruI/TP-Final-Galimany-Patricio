import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesPacientesComponent } from './detalles-pacientes.component';

describe('DetallesPacientesComponent', () => {
  let component: DetallesPacientesComponent;
  let fixture: ComponentFixture<DetallesPacientesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesPacientesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetallesPacientesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
