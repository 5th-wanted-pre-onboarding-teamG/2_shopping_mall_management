import { LocalDate, LocalDateTime } from 'js-joda';

describe('js-joda', () => {
  it('js-joda', () => {
    const now = LocalDate.now();
    const after = now.plusDays(7);
    const before = now.minusDays(7);

    console.log(`now=${now}`);
    console.log(`after=${after}`);
    console.log(`before=${before}`);

    expect(now.isBefore(after)).toBeTruthy();
    expect(now.isAfter(before)).toBeTruthy();
  });
});

describe('js-joda -LocalDateTime', () => {
  it('js-joda - LocalDateTime', () => {
    const now = LocalDateTime.now();
    const afterSevenDays = now.plusDays(7);
    const beforeSevenDays = now.minusDays(7);

    console.log(`now=${now}`);
    console.log(`after=${afterSevenDays}`);
    console.log(`before=${beforeSevenDays}`);

    expect(now.isBefore(afterSevenDays)).toBeTruthy();
    expect(now.isAfter(beforeSevenDays)).toBeTruthy();
  });
});
