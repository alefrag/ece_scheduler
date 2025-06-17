import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { InfoIcon } from "lucide-react";

type PreferenceLevel =
  | "No"
  | "Preferably No"
  | "Neutral"
  | "Preferably Yes"
  | "Yes";

type TimeSlot = {
  id: string;
  name: string;
  timeRange: string;
};

type Day = {
  id: string;
  name: string;
};

interface AvailabilitySelectorProps {
  onSave?: (availability: Record<string, PreferenceLevel>) => void;
  initialAvailability?: Record<string, PreferenceLevel>;
}

const timeSlots: TimeSlot[] = [
  { id: "morning", name: "Morning", timeRange: "08:00 - 12:00" },
  { id: "noon", name: "Noon", timeRange: "12:00 - 16:00" },
  { id: "afternoon", name: "Afternoon", timeRange: "16:00 - 20:00" },
];

const days: Day[] = [
  { id: "monday", name: "Monday" },
  { id: "tuesday", name: "Tuesday" },
  { id: "wednesday", name: "Wednesday" },
  { id: "thursday", name: "Thursday" },
  { id: "friday", name: "Friday" },
];

const preferenceLevels: { value: PreferenceLevel; color: string }[] = [
  { value: "No", color: "bg-red-500" },
  { value: "Preferably No", color: "bg-orange-400" },
  { value: "Neutral", color: "bg-gray-300" },
  { value: "Preferably Yes", color: "bg-blue-400" },
  { value: "Yes", color: "bg-green-500" },
];

const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  onSave = () => {},
  initialAvailability = {},
}) => {
  // Initialize availability with neutral values or provided initial values
  const [availability, setAvailability] = useState<
    Record<string, PreferenceLevel>
  >(() => {
    const defaultAvailability: Record<string, PreferenceLevel> = {};
    days.forEach((day) => {
      timeSlots.forEach((slot) => {
        const key = `${day.id}-${slot.id}`;
        defaultAvailability[key] = initialAvailability[key] || "Neutral";
      });
    });
    return defaultAvailability;
  });

  const [activeTab, setActiveTab] = useState<string>("grid");
  const [error, setError] = useState<string | null>(null);

  const handlePreferenceChange = (
    dayId: string,
    slotId: string,
    preference: PreferenceLevel,
  ) => {
    setAvailability((prev) => ({
      ...prev,
      [`${dayId}-${slotId}`]: preference,
    }));
  };

  const validateAndSave = () => {
    // Count slots marked as 'Preferably Yes' or 'Yes'
    const preferredSlotsCount = Object.values(availability).filter(
      (pref) => pref === "Preferably Yes" || pref === "Yes",
    ).length;

    if (preferredSlotsCount < 6) {
      setError(
        `You need to mark at least 6 slots as 'Preferably Yes' or 'Yes'. Currently marked: ${preferredSlotsCount}`,
      );
      return;
    }

    setError(null);
    onSave(availability);
  };

  const getPreferenceColor = (preference: PreferenceLevel): string => {
    return (
      preferenceLevels.find((level) => level.value === preference)?.color ||
      "bg-gray-300"
    );
  };

  return (
    <Card className="w-full max-w-4xl bg-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Weekly Availability Preferences
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <InfoIcon className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Mark your weekly availability preferences. You must select at
                  least 6 slots as 'Preferably Yes' or 'Yes'.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Set your weekly availability preferences by selecting preference
          levels for each time slot.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <TabsContent value="grid" className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2 border"></th>
                    {days.map((day) => (
                      <th
                        key={day.id}
                        className="p-2 border text-center font-medium"
                      >
                        {day.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map((slot) => (
                    <tr key={slot.id}>
                      <td className="p-2 border font-medium">
                        <div>{slot.name}</div>
                        <div className="text-xs text-gray-500">
                          {slot.timeRange}
                        </div>
                      </td>
                      {days.map((day) => {
                        const key = `${day.id}-${slot.id}`;
                        const currentPreference = availability[key];
                        return (
                          <td key={key} className="p-2 border text-center">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-6 h-6 rounded-full mb-1 ${getPreferenceColor(currentPreference)}`}
                              ></div>
                              <select
                                value={currentPreference}
                                onChange={(e) =>
                                  handlePreferenceChange(
                                    day.id,
                                    slot.id,
                                    e.target.value as PreferenceLevel,
                                  )
                                }
                                className="text-sm p-1 border rounded w-full"
                              >
                                {preferenceLevels.map((level) => (
                                  <option key={level.value} value={level.value}>
                                    {level.value}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          <TabsContent value="list" className="pt-4">
            <div className="space-y-6">
              {days.map((day) => (
                <div key={day.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-3">{day.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {timeSlots.map((slot) => {
                      const key = `${day.id}-${slot.id}`;
                      const currentPreference = availability[key];
                      return (
                        <div key={key} className="border rounded p-3">
                          <div className="flex justify-between items-center mb-2">
                            <div>
                              <div className="font-medium">{slot.name}</div>
                              <div className="text-xs text-gray-500">
                                {slot.timeRange}
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full ${getPreferenceColor(currentPreference)}`}
                            ></div>
                          </div>
                          <select
                            value={currentPreference}
                            onChange={(e) =>
                              handlePreferenceChange(
                                day.id,
                                slot.id,
                                e.target.value as PreferenceLevel,
                              )
                            }
                            className="w-full p-2 border rounded mt-1"
                          >
                            {preferenceLevels.map((level) => (
                              <option key={level.value} value={level.value}>
                                {level.value}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Legend:</h3>
          <div className="flex flex-wrap gap-4">
            {preferenceLevels.map((level) => (
              <div key={level.value} className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full mr-2 ${level.color}`}
                ></div>
                <span>{level.value}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setAvailability({})}>
          Reset
        </Button>
        <Button onClick={validateAndSave}>Save Preferences</Button>
      </CardFooter>
    </Card>
  );
};

export default AvailabilitySelector;
