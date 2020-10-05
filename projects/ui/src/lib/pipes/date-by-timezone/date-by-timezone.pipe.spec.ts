import { DateByTimezonePipe } from './date-by-timezone.pipe';

describe('DateByTimezonePipe', () => {
  it('create an instance', () => {
    const pipe = new DateByTimezonePipe('');
    expect(pipe).toBeTruthy();
  });
});
