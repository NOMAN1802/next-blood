
import { supabase, supabaseAdmin } from './customSupabaseClient';
import { districtsOfBangladesh, BLOOD_GROUPS } from './locations';

// Pure utility library for database operations.
// Does NOT import any React components or Contexts to prevent circular dependencies.

export const db = {
  constants: {
    bloodGroups: BLOOD_GROUPS,
    districts: districtsOfBangladesh
  },

  // Helper methods to get static data
  getBloodGroups: async () => {
    return BLOOD_GROUPS;
  },

  getDistricts: async () => {
    return districtsOfBangladesh;
  },

  diagnostics: {
    checkConnection: async () => {
      try {
        const { error } = await supabase.from('system_settings').select('id').limit(1);
        return { status: !error, message: error?.message };
      } catch (e) { return { status: false, message: e.message }; }
    },
    checkStorage: async () => {
       try {
         const { data, error } = await supabase.storage.listBuckets();
         return { status: !error && Array.isArray(data), message: error?.message };
       } catch (e) { return { status: false, message: e.message }; }
    },
    checkAuth: async () => {
       try {
          const { error } = await supabase.auth.getSession();
          return { status: !error, message: error?.message };
       } catch (e) { return { status: false, message: e.message }; }
    }
  },

  donors: {
    create: async (data) => {
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v != null)
      );
      const { data: result, error } = await supabase.from('donors').insert(cleanData).select().single();
      if (error) throw error;
      return result;
    },
    createBulk: async (dataArray) => {
      const { data, error } = await supabase.from('donors').insert(dataArray).select();
      if (error) throw error;
      return data;
    },
    getAll: async () => {
      const { data, error } = await supabase.from('donors').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    getByUserId: async (userId) => {
      const { data, error } = await supabase.from('donors').select('*').eq('user_id', userId).single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabase.from('donors').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabase.from('donors').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  doctors: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('doctors').select('*').order('full_name', { ascending: true });
      if (error) throw error;
      return data;
    },
    getById: async (id) => {
      const { data, error } = await supabaseAdmin.from('doctors').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('doctors').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('doctors').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('doctors').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  hospitals: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('hospitals').select('*').order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
    getById: async (id) => {
      const { data, error } = await supabaseAdmin.from('hospitals').select('*').eq('id', id).single();
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('hospitals').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('hospitals').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('hospitals').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  
  loginHistory: {
    create: async (data) => {
       const { data: result, error } = await supabase.from('login_history').insert(data).select().single();
       if (error) console.error("Error logging login history:", error);
       return result;
    },
    getAll: async () => {
      const { data, error } = await supabase.from('login_history').select('*').order('timestamp', { ascending: false }).limit(100);
      if (error) throw error;
      return data;
    }
  },

  requests: {
     getAll: async () => {
        const { data, error } = await supabase.from('blood_requests').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
     },
     create: async (data) => {
        const { data: result, error } = await supabase.from('blood_requests').insert(data).select().single();
        if (error) throw error;
        return result;
     }
  },
  
  history: {
     getAll: async () => {
        try {
            const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(50);
            if (!error && data && data.length > 0) return data;
        } catch (e) {
            console.warn("Audit logs fetch failed, falling back to login history");
        }

        const { data: loginData, error: loginError } = await supabase.from('login_history').select('*').order('timestamp', { ascending: false }).limit(50);
        if (loginError) return [];
        return loginData.map(l => ({
           id: l.id,
           action: 'Login',
           details: `Device: ${l.device}`,
           timestamp: l.timestamp,
           user_email: l.user_name || 'Unknown' 
        }));
     }
  },

  blog: {
    getAll: async (publishedOnly = false) => {
      let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false });
      if (publishedOnly) {
        query = query.eq('is_published', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    getBySlug: async (slug) => {
      const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabase.from('blog_posts').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    create: async (data) => {
      const { data: result, error } = await supabase.from('blog_posts').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },
  
  foundation: {
    get: async () => {
      const { data, error } = await supabaseAdmin.from('foundation_info').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    upsert: async (data) => {
      const { id, ...rest } = data;
      const payload = {
        ...(rest.name !== undefined && { name: rest.name }),
        ...(rest.founding_year !== undefined && { founding_year: rest.founding_year }),
        ...(rest.description !== undefined && { description: rest.description }),
        ...(rest.mission_statement !== undefined && { mission_statement: rest.mission_statement }),
        ...(rest.email !== undefined && { email: rest.email }),
        ...(rest.phone !== undefined && { phone: rest.phone }),
        ...(rest.address !== undefined && { address: rest.address }),
        ...(rest.logo_url !== undefined && { logo_url: rest.logo_url }),
        ...(rest.updated_at !== undefined && { updated_at: rest.updated_at }),
      };
      if (id) {
        const { data: result, error } = await supabaseAdmin.from('foundation_info').update(payload).eq('id', id).select().single();
        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabaseAdmin.from('foundation_info').insert(payload).select().single();
        if (error) throw error;
        return result;
      }
    }
  },

  founders: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('founders').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('founders').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('founders').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('founders').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  companies: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('powered_by_companies').select('*').order('display_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('powered_by_companies').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('powered_by_companies').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('powered_by_companies').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  socials: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('social_media_links').select('*');
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('social_media_links').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('social_media_links').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('social_media_links').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  volunteers: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('volunteers').select(`*, volunteer_social_links(*), volunteer_achievements(*)`).order('created_at', { ascending: true });
      if (error) throw error;
      return data;
    },
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('volunteers').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('volunteers').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('volunteers').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
    getById: async (id) => {
      const { data, error } = await supabaseAdmin.from('volunteers').select(`*, volunteer_social_links(*), volunteer_achievements(*)`).eq('id', id).single();
      if (error) throw error;
      return data;
    }
  },

  volunteerSocials: {
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('volunteer_social_links').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('volunteer_social_links').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  volunteerAchievements: {
    create: async (data) => {
      const { data: result, error } = await supabaseAdmin.from('volunteer_achievements').insert(data).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      const { error } = await supabaseAdmin.from('volunteer_achievements').delete().eq('id', id);
      if (error) throw error;
      return true;
    }
  },

  users: {
     getAll: async () => {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return data;
     },
     getById: async (id) => {
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (error) throw error;
        return data;
     },
     update: async (id, updates) => {
        const { data, error } = await supabase.from('users').update(updates).eq('id', id).select().single();
        if (error) throw error;
        return data;
     },
     deleteUser: async (id) => {
        const { error } = await supabase.from('users').delete().eq('id', id);
        if (error) throw error;
        return true;
     }
  },

  roles: {
    getAll: async () => {
      const { data, error } = await supabaseAdmin.from('roles').select('*').order('hierarchy', { ascending: false });
      if (error) throw error;
      return data;
    },
    update: async (id, data) => {
      const { data: result, error } = await supabaseAdmin.from('roles').update(data).eq('id', id).select().single();
      if (error) throw error;
      return result;
    },
    create: async (data) => {
      // Strip the slug-based id from form, let UUID auto-generate
      const { id: slug, ...rest } = data;
      const { data: result, error } = await supabaseAdmin.from('roles').insert({ ...rest, slug }).select().single();
      if (error) throw error;
      return result;
    },
    delete: async (id) => {
      // id may be UUID or slug — try both
      const { error } = await supabaseAdmin.from('roles').delete().or(`id.eq.${id},slug.eq.${id}`);
      if (error) throw error;
      return true;
    }
  },

  pages: {
    getAll: async () => {
      const { data, error } = await supabase.from('pages').select('*');
      if (error) throw error;
      return data;
    },
    getBySlug: async (slug) => {
      const { data, error } = await supabase.from('pages').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    }
  },

  settings: {
    getAll: async () => {
      const { data, error } = await supabase.from('system_settings').select('*').order('category');
      if (error) throw error;
      return data;
    },
    update: async (key, value) => {
      const { data, error } = await supabase
        .from('system_settings')
        .update({ value, updated_at: new Date() })
        .eq('key', key)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    create: async (payload) => {
      const { data, error } = await supabase.from('system_settings').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
       const { error } = await supabase.from('system_settings').delete().eq('id', id);
       if (error) throw error;
       return true;
    }
  },

  seo: {
     getAll: async () => {
        const { data, error } = await supabase.from('seo_metadata').select('*');
        if (error) throw error;
        return data;
     }
  },
  
  raceStations: {
    getAll: async () => {
      const { data, error } = await supabase.from('race_stations').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    updateStatus: async (id, status) => {
      const { data, error } = await supabase.from('race_stations').update({ status, updated_at: new Date() }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    }
  },

  uploads: {
    uploadFile: async (file, bucket = 'uploads') => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return { file_url: publicUrl, file_name: fileName };
    }
  }
};
