import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Generate a random URL code for guests
export function generateUrlCode() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let code = "";
  for (let i = 0; i < 10; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Guest-related functions
export async function getGuestByUrlCode(urlCode) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("url_code", urlCode)
    .single();

  if (error) {
    console.error("Error fetching guest:", error);
    return null;
  }

  return data;
}

export async function getGuestByEmail(email) {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching guest by email:", error);
    return null;
  }

  return data;
}

export async function updateGuestRSVP(guestId, rsvpData) {
  const updateData = {
    rsvp: rsvpData.rsvp,
    rsvp_count: rsvpData.rsvpCount,
    food_restrictions: rsvpData.foodRestrictions,
    updated_at: new Date().toISOString(),
  };

  if (rsvpData.email !== undefined) {
    updateData.email = rsvpData.email;
  }

  const { data, error } = await supabase
    .from("guests")
    .update(updateData)
    .eq("id", guestId)
    .select()
    .single();

  if (error) {
    console.error("Error updating RSVP:", JSON.stringify(error, null, 2));
    console.error(
      "Error details:",
      error.message,
      error.code,
      error.details,
      error.hint,
    );
    throw error;
  }

  return data;
}

export async function updateGuestLanguage(guestId, language) {
  const { data, error } = await supabase
    .from("guests")
    .update({
      language: language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestId)
    .select()
    .single();

  if (error) {
    console.error("Error updating language:", error);
    throw error;
  }

  return data;
}

// Admin functions
export async function getAllGuests() {
  const { data, error } = await supabase
    .from("guests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all guests:", error);
    throw error;
  }

  return data;
}

export async function createGuest(guestData) {
  const urlCode = generateUrlCode();

  const { data, error } = await supabase
    .from("guests")
    .insert([
      {
        name: guestData.name,
        email: guestData.email || null,
        reserved_spots: guestData.reservedSpots || 1,
        url_code: urlCode,
        language: guestData.language || "en",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("Error creating guest:", error);
    throw error;
  }

  return data;
}

export async function updateGuest(guestId, guestData) {
  const { data, error } = await supabase
    .from("guests")
    .update({
      name: guestData.name,
      email: guestData.email,
      reserved_spots: guestData.reservedSpots,
      updated_at: new Date().toISOString(),
    })
    .eq("id", guestId)
    .select()
    .single();

  if (error) {
    console.error("Error updating guest:", error);
    throw error;
  }

  return data;
}

export async function deleteGuest(guestId) {
  const { error } = await supabase.from("guests").delete().eq("id", guestId);

  if (error) {
    console.error("Error deleting guest:", error);
    throw error;
  }

  return true;
}

// Check if user is admin
export async function isAdmin(email) {
  const { data, error } = await supabase
    .from("admin_users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) {
    return false;
  }

  return true;
}

// Email authentication functions
export async function signInWithEmail(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
    },
  });

  if (error) {
    console.error("Error sending magic link:", error);
    throw error;
  }

  return data;
}

export async function verifyOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }

  return data;
}
