import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewTestModalComponent } from './add-new-test-modal.component';

describe('AddNewTestModalComponent', () => {
  let component: AddNewTestModalComponent;
  let fixture: ComponentFixture<AddNewTestModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewTestModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewTestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
