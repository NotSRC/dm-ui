import { SafeHtmlPipe } from './cut-number.pipe';

describe('CutNumberPipe', () => {
  it('create an instance', () => {
    const pipe = new SafeHtmlPipe();
    expect(pipe).toBeTruthy();
  });
});
