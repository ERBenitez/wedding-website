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

// Guest-related functions (use RPC for security)
export async function getGuestByUrlCode(urlCode) {
  const { data, error } = await supabase.rpc("get_guest_by_code", {
    p_url_code: urlCode,
  });

  if (error) {
    console.error("Error fetching guest:", error);
    return null;
  }

  return data;
}

export async function getGuestByEmail(email) {
  const { data, error } = await supabase.rpc("get_guest_by_email", {
    p_email: email,
  });

  if (error) {
    console.error("Error fetching guest by email:", error);
    return null;
  }

  return data;
}

export async function updateGuestRSVP(guestId, rsvpData) {
  const { data, error } = await supabase.rpc("update_rsvp", {
    p_guest_id: guestId,
    p_rsvp: rsvpData.rsvp,
    p_rsvp_count: rsvpData.rsvpCount,
    p_adults_count: rsvpData.adultsCount ?? 0,
    p_kids_7_to_9_count: rsvpData.kids7to9Count ?? 0,
    p_kids_6_under_count: rsvpData.kids6UnderCount ?? 0,
    p_food_restrictions: rsvpData.foodRestrictions || "",
    p_email: rsvpData.email || null,
  });

  if (error) {
    console.error("Error updating RSVP:", JSON.stringify(error, null, 2));
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

// Admin functions (protected by "Admin full access" RLS policy)
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

// Check if user is admin (uses RPC for security)
export async function isAdmin(email) {
  const { data, error } = await supabase.rpc("check_is_admin", {
    p_email: email,
  });

  if (error) {
    console.error("Error checking admin status:", error);
    return false;
  }

  return data === true;
}

// Email authentication functions
export async function signInWithEmail(email) {
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
  });

  if (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }

  return data;
}

export async function verifyOtp(email, token) {
  // Try "email" type first (returning users)
  const { data, error } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "email",
  });

  if (!error) return data;

  // If that fails, try "signup" type (new users)
  const { data: signupData, error: signupError } = await supabase.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });

  if (!signupError) return signupData;

  // Both failed — throw the original error
  console.error("Error verifying OTP:", error);
  throw error;
}