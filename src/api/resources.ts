import { supabase } from "../lib/supabaseClient";
import { Classroom, Laboratory } from "../types/database";

export const classroomsApi = {
  // Get all classrooms
  getAll: async (): Promise<Classroom[]> => {
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  // Get classroom by ID
  getById: async (id: string): Promise<Classroom | null> => {
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new classroom
  create: async (
    classroomData: Omit<Classroom, "id" | "created_at" | "updated_at">,
  ): Promise<Classroom> => {
    const { data, error } = await supabase
      .from("classrooms")
      .insert({
        ...classroomData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update classroom
  update: async (
    id: string,
    classroomData: Partial<Omit<Classroom, "id" | "created_at">>,
  ): Promise<Classroom> => {
    const { data, error } = await supabase
      .from("classrooms")
      .update({
        ...classroomData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete classroom
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("classrooms").delete().eq("id", id);

    if (error) throw error;
  },
};

export const laboratoriesApi = {
  // Get all laboratories
  getAll: async (): Promise<Laboratory[]> => {
    const { data, error } = await supabase
      .from("laboratories")
      .select("*")
      .order("name");

    if (error) throw error;
    return data || [];
  },

  // Get laboratory by ID
  getById: async (id: string): Promise<Laboratory | null> => {
    const { data, error } = await supabase
      .from("laboratories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new laboratory
  create: async (
    labData: Omit<Laboratory, "id" | "created_at" | "updated_at">,
  ): Promise<Laboratory> => {
    const { data, error } = await supabase
      .from("laboratories")
      .insert({
        ...labData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update laboratory
  update: async (
    id: string,
    labData: Partial<Omit<Laboratory, "id" | "created_at">>,
  ): Promise<Laboratory> => {
    const { data, error } = await supabase
      .from("laboratories")
      .update({
        ...labData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete laboratory
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("laboratories").delete().eq("id", id);

    if (error) throw error;
  },
};
