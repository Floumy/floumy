import { Timeline } from "./timeline.enum";

export class TimelineService {
  static getCurrentQuarter() {
    return Math.floor((new Date().getMonth() + 3) / 3);
  }

  static calculateQuarterDates(quarter: number) {
    return {
      startDate: new Date(new Date().getFullYear(), 3 * quarter - 3, 1),
      endDate: new Date(new Date().getFullYear(), 3 * quarter, 0)
    };
  }

  static getStartAndEndDatesByTimelineValue(timeline: string) {
    const currentQuarter = TimelineService.getCurrentQuarter();
    if (timeline === Timeline.THIS_QUARTER.valueOf()) {
      return TimelineService.calculateQuarterDates(currentQuarter);
    }
    if (timeline === Timeline.NEXT_QUARTER.valueOf()) {
      return TimelineService.calculateQuarterDates(currentQuarter + 1);
    }
    return {
      startDate: null,
      endDate: null
    };
  }

  static convertDateToTimeline(date: Date): Timeline {
    const today = new Date();
    if (date < today) return Timeline.PAST;
    if (date.getFullYear() === today.getFullYear()) {
      const quarter = Math.floor((date.getMonth() + 3) / 3);
      const currentQuarter = Math.floor((today.getMonth() + 3) / 3);
      if (quarter === currentQuarter) return Timeline.THIS_QUARTER;
      if (quarter === currentQuarter + 1) return Timeline.NEXT_QUARTER;
    }
    return Timeline.LATER;
  }
}
