/**
 * EVLab BIM Core v1.3 - Construction Working Calendar Engine
 * Handles Working Days, Shift Hours (e.g. 06:00-14:00, 14:00-22:00), Weekends, Holidays, and Duration Calculation.
 */

export interface WorkShift {
  name: string;
  startHour: number; // e.g. 8 (08:00)
  endHour: number;   // e.g. 17 (17:00)
  hoursPerDay: number;
}

export interface ConstructionCalendar {
  id: string;
  name: string;
  workingDays: number[]; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (Default Mon-Fri: [1,2,3,4,5] or Mon-Sat: [1,2,3,4,5,6])
  shifts: WorkShift[];
  holidays: string[]; // ISO Date strings "YYYY-MM-DD"
  defaultDailyHours: number;
}

export const DEFAULT_CONSTRUCTION_CALENDAR: ConstructionCalendar = {
  id: 'cal_standard_site',
  name: 'Standard Construction Site (6-Day Double Shift)',
  workingDays: [1, 2, 3, 4, 5, 6], // Mon-Sat
  shifts: [
    { name: 'Shift 1 (Morning)', startHour: 6, endHour: 14, hoursPerDay: 8 },
    { name: 'Shift 2 (Evening)', startHour: 14, endHour: 22, hoursPerDay: 8 }
  ],
  holidays: ['2026-01-01', '2026-05-01', '2026-12-25'],
  defaultDailyHours: 16
};

export class CalendarEngine {
  private calendar: ConstructionCalendar;

  constructor(calendar: ConstructionCalendar = DEFAULT_CONSTRUCTION_CALENDAR) {
    this.calendar = calendar;
  }

  public getCalendar(): ConstructionCalendar {
    return this.calendar;
  }

  public setCalendar(calendar: ConstructionCalendar) {
    this.calendar = calendar;
  }

  public isWorkingDay(date: Date): boolean {
    const dayOfWeek = date.getDay();
    if (!this.calendar.workingDays.includes(dayOfWeek)) {
      return false;
    }
    const dateStr = date.toISOString().split('T')[0];
    if (this.calendar.holidays.includes(dateStr)) {
      return false;
    }
    return true;
  }

  /**
   * Add N working days to a start date respecting weekends and holidays
   */
  public addWorkingDays(startDate: Date, daysToAdd: number): Date {
    const curr = new Date(startDate.getTime());
    let added = 0;
    while (added < daysToAdd) {
      curr.setDate(curr.getDate() + 1);
      if (this.isWorkingDay(curr)) {
        added++;
      }
    }
    return curr;
  }

  /**
   * Calculate working days difference between two dates
   */
  public calculateWorkingDays(startDate: Date, finishDate: Date): number {
    if (startDate > finishDate) return 0;
    let count = 0;
    const curr = new Date(startDate.getTime());
    while (curr <= finishDate) {
      if (this.isWorkingDay(curr)) {
        count++;
      }
      curr.setDate(curr.getDate() + 1);
    }
    return Math.max(1, count);
  }
}
