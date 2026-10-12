-- ==============================================================================
-- ET-03 Live Learning Platform: Supabase PostgreSQL Schema & Seed Data
-- ==============================================================================
-- Execute this script in your Supabase SQL Editor:
-- Project URL: https://xbqoyupdveusmqijwnkl.supabase.co
-- ==============================================================================

-- 1. Create Profiles / Students Table
CREATE TABLE IF NOT EXISTS public.profiles (
    student_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    grade TEXT DEFAULT '9',
    cohort TEXT DEFAULT 'Alpha-26',
    mastery INTEGER DEFAULT 68 CHECK (mastery >= 0 AND mastery <= 100),
    total_attempts INTEGER DEFAULT 0,
    correction_rate INTEGER DEFAULT 0 CHECK (correction_rate >= 0 AND correction_rate <= 100),
    teacher_escalations INTEGER DEFAULT 0,
    active_streak INTEGER DEFAULT 1,
    learning_pace TEXT DEFAULT 'guided' CHECK (learning_pace IN ('guided', 'standard', 'accelerated')),
    notifications_enabled BOOLEAN DEFAULT true,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'struggling', 'excelling', 'inactive')),
    top_misconception TEXT,
    topic TEXT DEFAULT 'Linear Equations',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create Attempts Table (Stores every submission from n8n & frontend)
CREATE TABLE IF NOT EXISTS public.attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES public.profiles(student_id) ON DELETE CASCADE,
    topic TEXT NOT NULL DEFAULT 'Linear Equations',
    question TEXT NOT NULL,
    expected_answer TEXT,
    student_answer TEXT NOT NULL,
    steps TEXT,
    verdict TEXT NOT NULL CHECK (verdict IN ('correct', 'incorrect', 'partial')),
    misconception_type TEXT,
    feedback_level INTEGER DEFAULT 1,
    feedback TEXT,
    retry_question TEXT,
    confidence NUMERIC DEFAULT 0.85,
    teacher_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast student queries & timeline ordering
CREATE INDEX IF NOT EXISTS idx_attempts_student_created ON public.attempts(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_attempts_misconception ON public.attempts(misconception_type);

-- 3. Create Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('video', 'article', 'practice', 'simulation')),
    source TEXT NOT NULL,
    url TEXT,
    description TEXT,
    topic TEXT NOT NULL,
    difficulty TEXT DEFAULT 'intermediate' CHECK (difficulty IN ('foundational', 'intermediate', 'advanced')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Create Interventions Table
CREATE TABLE IF NOT EXISTS public.interventions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id TEXT NOT NULL REFERENCES public.profiles(student_id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    concept TEXT NOT NULL,
    observed_issue TEXT NOT NULL,
    recommended_intervention TEXT NOT NULL,
    practice_count INTEGER DEFAULT 1,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interventions ENABLE ROW LEVEL SECURITY;

-- Allow public read & write access via anon key (ideal for prototype / student app)
CREATE POLICY "Allow anon read on profiles" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert/update on profiles" ON public.profiles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Allow anon read on attempts" ON public.attempts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert on attempts" ON public.attempts FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Allow anon read on resources" ON public.resources FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon read on interventions" ON public.interventions FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Allow anon insert/update on interventions" ON public.interventions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- SEED DATA (INITIAL DATA FOR DEMO & TESTING)
-- ==============================================================================

-- Seed Profiles
INSERT INTO public.profiles (student_id, name, grade, cohort, mastery, total_attempts, correction_rate, teacher_escalations, status, top_misconception, topic)
VALUES
    ('demo-001', 'Alex Johnson', '9', 'Alpha-26', 68, 14, 72, 2, 'active', 'invalid_inverse_operation', 'Linear Equations'),
    ('demo-002', 'Sarah Chen', '9', 'Alpha-26', 85, 22, 88, 0, 'excelling', 'arithmetic_subtraction_error', 'Linear Equations'),
    ('demo-003', 'Marcus Williams', '9', 'Alpha-26', 42, 8, 38, 3, 'struggling', 'incorrect_algebraic_manipulation', 'Linear Equations'),
    ('demo-004', 'Emily Rodriguez', '9', 'Alpha-26', 91, 30, 93, 0, 'excelling', NULL, 'Quadratic Equations'),
    ('demo-005', 'James Kim', '9', 'Alpha-26', 55, 11, 54, 2, 'struggling', 'invalid_inverse_operation', 'Linear Equations'),
    ('demo-006', 'Priya Patel', '9', 'Alpha-26', 78, 19, 79, 1, 'active', 'arithmetic_subtraction_error', 'Linear Equations')
ON CONFLICT (student_id) DO UPDATE SET
    mastery = EXCLUDED.mastery,
    total_attempts = EXCLUDED.total_attempts,
    correction_rate = EXCLUDED.correction_rate,
    updated_at = now();

-- Seed Sample Attempts for Alex Johnson (demo-001)
INSERT INTO public.attempts (student_id, topic, question, student_answer, steps, verdict, misconception_type, feedback_level, feedback, retry_question, confidence)
VALUES
    ('demo-001', 'Linear Equations', 'Solve 3x + 5 = 20', '3x = 25', '3x + 5 = 20\n3x = 20 + 5\n3x = 25', 'incorrect', 'invalid_inverse_operation', 2, 'When undoing +5, perform the opposite operation: subtract 5 from both sides.', 'Solve 4x + 7 = 23', 0.85),
    ('demo-001', 'Linear Equations', 'Solve 4x + 6 = 22', 'x = 4', '4x + 6 = 22\n4x = 22 - 6\n4x = 16\nx = 4', 'correct', NULL, 1, 'Excellent! You correctly applied inverse operations.', NULL, 0.98),
    ('demo-001', 'Linear Equations', 'Solve 2(x + 3) = 16', 'x = 6.5', '2(x + 3) = 16\n2x + 3 = 16\n2x = 13\nx = 6.5', 'incorrect', 'incorrect_algebraic_manipulation', 2, 'Remember to distribute the multiplier 2 across BOTH terms inside the parentheses.', 'Solve 3(x + 2) = 21', 0.82)
ON CONFLICT DO NOTHING;

-- Seed Curated Resources
INSERT INTO public.resources (id, title, type, source, url, description, topic, difficulty)
VALUES
    ('res-1', 'Understanding Inverse Operations in Linear Equations', 'video', 'Khan Academy', 'https://www.khanacademy.org/math/algebra/x2f8bb11595b61c86:solve-equations-inequalities', 'Master isolating the variable by undoing addition, subtraction, multiplication, and division.', 'Linear Equations', 'foundational'),
    ('res-2', 'Avoiding Common Arithmetic Slips When Isolating Variables', 'article', 'OpenStax Math', 'https://openstax.org/books/elementary-algebra-2e', 'A concise step-by-step visual guide on keeping equation balance across equal signs.', 'Linear Equations', 'foundational'),
    ('res-3', 'Interactive Equation Balance Scale Visualizer', 'simulation', 'PhET Interactive Simulations', 'https://phet.colorado.edu/en/simulations/equality-explorer', 'Interactive visual scale demonstrating why whatever operation is done to one side must be done to the other.', 'Linear Equations', 'intermediate'),
    ('res-4', 'Mastering the Distributive Property with Negative Signs', 'video', 'Math Antics', 'https://mathantics.com', 'Clear animated walkthrough of bracket expansion when negative multipliers are present.', 'Linear Equations', 'intermediate')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description;

-- Seed Interventions
INSERT INTO public.interventions (student_id, student_name, concept, observed_issue, recommended_intervention, practice_count, status)
VALUES
    ('demo-003', 'Marcus Williams', 'Distributive Property with Negatives', 'Dropped negative multiplier across parentheses (-2(x - 4) written as -2x - 8).', 'Use color-coded distribution boxes and assign 3 scaffolded practice problems.', 8, 'pending'),
    ('demo-005', 'James Kim', 'Inverse Operations on Constant Terms', 'Added instead of subtracted when isolating variable term on left side.', 'Interactive visual balance scale demonstration to reinforce inverse symmetry.', 11, 'pending'),
    ('demo-001', 'Alex Johnson', 'Variable Isolation Sign Conventions', 'Subtracted constant correctly but incorrectly divided by negative coefficient.', 'Targeted mini-assignment: 5 sign-inversion drill problems.', 14, 'assigned')
ON CONFLICT DO NOTHING;
