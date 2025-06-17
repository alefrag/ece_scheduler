import { supabase } from "../lib/supabaseClient";
import { Scenario, InstructorAssignment } from "../types/database";

export const scenariosApi = {
  // Get all scenarios
  getAll: async (): Promise<Scenario[]> => {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get scenario by ID
  getById: async (id: string): Promise<Scenario | null> => {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Get scenarios by user
  getByUser: async (userId: string): Promise<Scenario[]> => {
    const { data, error } = await supabase
      .from("scenarios")
      .select("*")
      .eq("created_by", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create new scenario
  create: async (
    scenarioData: Omit<Scenario, "id" | "created_at" | "updated_at">,
  ): Promise<Scenario> => {
    const { data, error } = await supabase
      .from("scenarios")
      .insert({
        ...scenarioData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update scenario
  update: async (
    id: string,
    scenarioData: Partial<Omit<Scenario, "id" | "created_at">>,
  ): Promise<Scenario> => {
    const { data, error } = await supabase
      .from("scenarios")
      .update({
        ...scenarioData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete scenario
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("scenarios").delete().eq("id", id);

    if (error) throw error;
  },

  // Publish scenario
  publish: async (id: string): Promise<Scenario> => {
    const { data, error } = await supabase
      .from("scenarios")
      .update({
        status: "published",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const instructorAssignmentsApi = {
  // Get assignments by scenario
  getByScenario: async (
    scenarioId: string,
  ): Promise<InstructorAssignment[]> => {
    const { data, error } = await supabase
      .from("instructor_assignments")
      .select("*")
      .eq("scenario_id", scenarioId)
      .order("created_at");

    if (error) throw error;
    return data || [];
  },

  // Create new assignment
  create: async (
    assignmentData: Omit<
      InstructorAssignment,
      "id" | "created_at" | "updated_at"
    >,
  ): Promise<InstructorAssignment> => {
    const { data, error } = await supabase
      .from("instructor_assignments")
      .insert({
        ...assignmentData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update assignment
  update: async (
    id: string,
    assignmentData: Partial<Omit<InstructorAssignment, "id" | "created_at">>,
  ): Promise<InstructorAssignment> => {
    const { data, error } = await supabase
      .from("instructor_assignments")
      .update({
        ...assignmentData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete assignment
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from("instructor_assignments")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Bulk create assignments
  createBulk: async (
    assignments: Omit<
      InstructorAssignment,
      "id" | "created_at" | "updated_at"
    >[],
  ): Promise<InstructorAssignment[]> => {
    const assignmentsToInsert = assignments.map((assignment) => ({
      ...assignment,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase
      .from("instructor_assignments")
      .insert(assignmentsToInsert)
      .select();

    if (error) throw error;
    return data || [];
  },
};
