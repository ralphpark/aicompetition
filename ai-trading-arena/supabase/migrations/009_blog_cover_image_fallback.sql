-- ============================================
-- Blog cover image fallback trigger
-- When a blog post is inserted without a cover_image,
-- automatically copy the most recent cover_image from the same category
-- Applied: 2026-02-11
-- ============================================

CREATE OR REPLACE FUNCTION public.blog_cover_image_fallback()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_fallback_image TEXT;
BEGIN
  -- Only apply if cover_image is NULL after insert
  IF NEW.cover_image IS NULL THEN
    -- Get most recent cover_image from same category
    SELECT cover_image INTO v_fallback_image
    FROM public.blog_posts
    WHERE category = NEW.category
      AND cover_image IS NOT NULL
      AND id != NEW.id
    ORDER BY created_at DESC
    LIMIT 1;

    IF v_fallback_image IS NOT NULL THEN
      NEW.cover_image := v_fallback_image;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger (BEFORE INSERT so we can modify NEW)
DROP TRIGGER IF EXISTS trg_blog_cover_image_fallback ON public.blog_posts;
CREATE TRIGGER trg_blog_cover_image_fallback
  BEFORE INSERT ON public.blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.blog_cover_image_fallback();
