export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      services: {
        Row: {
          id: number;
          name_ar: string;
          name_en: string;
          display_name_ar: string | null;
          category_ar: string | null;
          description_ar: string | null;
          description_en: string | null;
          price: number | string;
          duration_minutes: number;
          image_url: string | null;
          branch_slugs: string;
          is_featured: boolean;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name_ar: string;
          name_en: string;
          display_name_ar?: string | null;
          category_ar?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          price: number | string;
          duration_minutes: number;
          image_url?: string | null;
          branch_slugs?: string;
          is_featured?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name_ar?: string;
          name_en?: string;
          display_name_ar?: string | null;
          category_ar?: string | null;
          description_ar?: string | null;
          description_en?: string | null;
          price?: number | string;
          duration_minutes?: number;
          image_url?: string | null;
          branch_slugs?: string;
          is_featured?: boolean;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      offers: {
        Row: {
          id: number;
          title_ar: string;
          title_en: string;
          description_ar: string | null;
          description_en: string | null;
          details_ar: string | null;
          details_en: string | null;
          old_price: number | string;
          new_price: number | string;
          image_url: string | null;
          badge_ar: string | null;
          valid_until: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          title_ar: string;
          title_en: string;
          description_ar?: string | null;
          description_en?: string | null;
          details_ar?: string | null;
          details_en?: string | null;
          old_price: number | string;
          new_price: number | string;
          image_url?: string | null;
          badge_ar?: string | null;
          valid_until?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          title_ar?: string;
          title_en?: string;
          description_ar?: string | null;
          description_en?: string | null;
          details_ar?: string | null;
          details_en?: string | null;
          old_price?: number | string;
          new_price?: number | string;
          image_url?: string | null;
          badge_ar?: string | null;
          valid_until?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      branches: {
        Row: {
          id: number;
          slug: string;
          name_ar: string;
          listing_name_ar: string | null;
          badge_ar: string | null;
          address_ar: string;
          landmark_ar: string | null;
          summary_ar: string | null;
          phone_display: string;
          phone_href: string;
          whatsapp: string;
          hours_ar: string;
          lat: number | null;
          lng: number | null;
          price_list_image: string | null;
          google_rating: number | null;
          google_reviews: number | null;
          maps_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          slug: string;
          name_ar: string;
          listing_name_ar?: string | null;
          badge_ar?: string | null;
          address_ar: string;
          landmark_ar?: string | null;
          summary_ar?: string | null;
          phone_display: string;
          phone_href: string;
          whatsapp: string;
          hours_ar: string;
          lat?: number | null;
          lng?: number | null;
          price_list_image?: string | null;
          google_rating?: number | null;
          google_reviews?: number | null;
          maps_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          slug?: string;
          name_ar?: string;
          listing_name_ar?: string | null;
          badge_ar?: string | null;
          address_ar?: string;
          landmark_ar?: string | null;
          summary_ar?: string | null;
          phone_display?: string;
          phone_href?: string;
          whatsapp?: string;
          hours_ar?: string;
          lat?: number | null;
          lng?: number | null;
          price_list_image?: string | null;
          google_rating?: number | null;
          google_reviews?: number | null;
          maps_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      gallery_images: {
        Row: {
          id: number;
          src: string;
          alt: string;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          src: string;
          alt: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          src?: string;
          alt?: string;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      barbers: {
        Row: {
          id: number;
          name_ar: string;
          name_en: string;
          role_ar: string;
          role_en: string;
          bio_ar: string | null;
          bio_en: string | null;
          image_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name_ar: string;
          name_en: string;
          role_ar: string;
          role_en: string;
          bio_ar?: string | null;
          bio_en?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name_ar?: string;
          name_en?: string;
          role_ar?: string;
          role_en?: string;
          bio_ar?: string | null;
          bio_en?: string | null;
          image_url?: string | null;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      testimonials: {
        Row: {
          id: number;
          customer_name: string;
          comment_ar: string;
          comment_en: string | null;
          rating: number;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          customer_name: string;
          comment_ar: string;
          comment_en?: string | null;
          rating: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          customer_name?: string;
          comment_ar?: string;
          comment_en?: string | null;
          rating?: number;
          sort_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: number;
          customer_name: string;
          customer_phone: string;
          service_id: number | null;
          service_name: string | null;
          barber_id: number | null;
          branch_slug: string | null;
          appointment_date: string;
          notes: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          customer_name: string;
          customer_phone: string;
          service_id?: number | null;
          service_name?: string | null;
          barber_id?: number | null;
          branch_slug?: string | null;
          appointment_date: string;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          customer_name?: string;
          customer_phone?: string;
          service_id?: number | null;
          service_name?: string | null;
          barber_id?: number | null;
          branch_slug?: string | null;
          appointment_date?: string;
          notes?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: string;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string;
          updated_at?: string;
        };
      };
      media: {
        Row: {
          id: number;
          file_name: string;
          file_url: string;
          mime_type: string | null;
          size_bytes: number | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          file_name: string;
          file_url: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
        Update: {
          id?: number;
          file_name?: string;
          file_url?: string;
          mime_type?: string | null;
          size_bytes?: number | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
