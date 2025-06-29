import { mockOldSchedule, mockNewSchedule } from "./data/old-schedule.ts";
import ScheduleComparisonTimeline from "./schedule_comparison_timeline.tsx";


const CompareTimelineView = () => {

    return (
        <div>// Then use the component
        <ScheduleComparisonTimeline 
        oldSchedule={mockOldSchedule} 
        newSchedule={mockNewSchedule} 
        comparisonOptions={{ timeToleranceMinutes: 5 }}
        />
        </div>
    )

};

export default CompareTimelineView;