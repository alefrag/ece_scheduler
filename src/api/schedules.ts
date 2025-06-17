import { supabase } from "../lib/supabaseClient";
import { ScheduleEvent } from "../types/database";

export const schedulesApi = {
  // Get all schedule events
  getAll: async (): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from("schedule_events")
      .select("*")
      .order("day")
      .order("start_time");

    if (error) throw error;
    return data || [];
  },

  // Get schedule events by date range
  getByDateRange: async (
    startDate: string,
    endDate: string,
  ): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from("schedule_events")
      .select("*")
      .gte("created_at", startDate)
      .lte("created_at", endDate)
      .order("day")
      .order("start_time");

    if (error) throw error;
    return data || [];
  },

  // Get schedule events by instructor
  getByInstructor: async (instructor: string): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from("schedule_events")
      .select("*")
      .eq("instructor", instructor)
      .order("day")
      .order("start_time");

    if (error) throw error;
    return data || [];
  },

  // Get schedule events by room
  getByRoom: async (room: string): Promise<ScheduleEvent[]> => {
    const { data, error } = await supabase
      .from("schedule_events")
      .select("*")
      .eq("room", room)
      .order("day")
      .order("start_time");

    if (error) throw error;
    return data || [];
  },

  // Create new schedule event
  create: async (
    eventData: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">,
  ): Promise<ScheduleEvent> => {
    const { data, error } = await supabase
      .from("schedule_events")
      .insert({
        ...eventData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update schedule event
  update: async (
    id: string,
    eventData: Partial<Omit<ScheduleEvent, "id" | "created_at">>,
  ): Promise<ScheduleEvent> => {
    const { data, error } = await supabase
      .from("schedule_events")
      .update({
        ...eventData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete schedule event
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("schedule_events")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Bulk create schedule events
  createBulk: async (
    events: Omit<ScheduleEvent, "id" | "created_at" | "updated_at">[],
  ): Promise<ScheduleEvent[]> => {
    const eventsToInsert = events.map((event) => ({
      ...event,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("schedule_events")
      .insert(eventsToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },
};
