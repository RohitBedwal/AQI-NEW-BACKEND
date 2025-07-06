const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY  // ✅ MUST use service role
);

module.exports = {
  supabase,
  from: (table) => ({
    insert: async (data) => {
      const { data: inserted, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) {
        console.error(`❌ DB INSERT error:`, error);
        throw error;
      }
      return inserted;
    },
  }),
};
