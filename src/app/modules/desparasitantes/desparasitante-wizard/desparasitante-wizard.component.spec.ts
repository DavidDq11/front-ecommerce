import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesparasitanteWizardComponent } from './desparasitante-wizard.component';

describe('DesparasitanteWizardComponent', () => {
  let component: DesparasitanteWizardComponent;
  let fixture: ComponentFixture<DesparasitanteWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DesparasitanteWizardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DesparasitanteWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
