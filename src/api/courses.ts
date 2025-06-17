import { supabase } from "../lib/supabaseClient";
import { Course } from "../types/database";

export const coursesApi = {
  // Get all courses
  getAll: async (): Promise<Course[]> => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get course by ID
  getById: async (id: string): Promise<Course | null> => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new course
  create: async (
    courseData: Omit<Course, "id" | "created_at" | "updated_at">,
  ): Promise<Course> => {
    const { data, error } = await supabase
      .from("courses")
      .insert({
        ...courseData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update course
  update: async (
    id: string,
    courseData: Partial<Omit<Course, "id" | "created_at">>,
  ): Promise<Course> => {
    const { data, error } = await supabase
      .from("courses")
      .update({
        ...courseData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete course
  delete: async (id: string): Promise<void> => {
    const { error } = await supabase.from("courses").delete().eq("id", id);

    if (error) throw error;
  },

  // Get courses by study program
  getByStudyProgram: async (programId: string): Promise<Course[]> => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .contains("study_programs", [programId])
      .order("name");

    if (error) throw error;
    return data || [];
  },

  // Get courses by semester
  getBySemester: async (semester: number): Promise<Course[]> => {
    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .contains("semesters", [semester])
      .order("name");

    if (error) throw error;
    return data || [];
  },
};
