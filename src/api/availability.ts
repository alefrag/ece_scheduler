import { supabase } from "../lib/supabaseClient";
import { AvailabilityPreference } from "../types/database";

export const availabilityApi = {
  // Get availability preferences for a user
  getByUserId: async (userId: string): Promise<AvailabilityPreference[]> => {
    const { data, error } = await supabase
      .from("availability_preferences")
      .select("*")
      .eq("user_id", userId)
      .order("day")
      .order("time_slot");

    if (error) throw error;
    return data || [];
  },

  // Create or update availability preferences
  upsertPreferences: async (
    userId: string,
    preferences: Record<string, string>,
  ): Promise<AvailabilityPreference[]> => {
    // First, delete existing preferences for the user
    await supabase
      .from("availability_preferences")
      .delete()
      .eq("user_id", userId);

    // Then insert new preferences
    const preferencesToInsert = Object.entries(preferences).map(
      ([key, preference]) => {
        const [day, timeSlot] = key.split("-");
        return {
          user_id: userId,
          day,
          time_slot: timeSlot,
          preference: preference as
            | "No"
            | "Preferably No"
            | "Neutral"
            | "Preferably Yes"
            | "Yes",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
      },
    );

    const { data, error } = await supabase
      .from("availability_preferences")
      .insert(preferencesToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },

  // Get availability for all users (for schedule managers)
  getAllAvailability: async (): Promise<AvailabilityPreference[]> => {
    const { data, error } = await supabase
      .from("availability_preferences")
      .select(
        `
        *,
        users (
          name,
          email,
          role
        )
      `,
      )
      .order("user_id")
      .order("day")
      .order("time_slot");

    if (error) throw error;
    return data || [];
  },

  // Delete availability preferences for a user
  deleteByUserId: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from("availability_preferences")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;
  },
};
